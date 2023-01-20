import * as d3 from 'd3';

import { assign_defaults } from './../utils/object_utils.mjs';

import {
	number_to_percent,
	radians_to_degrees
} from './../utils/math.mjs';

import Font from './../components/font.mjs';
import Image from './../components/image.mjs';
import Chart from './default_chart.mjs';

const IMAGE_TRANSFORM = 'translate(500, 500)';

class PieChart extends Chart {
	static default_options = {
		inner_radius: 0, // Above 0 creates a doughnut
		text_distance_scale: 0.5, // how far the text is scaled away from the center (0.5 = halfway)
		rotate_labels: false,
		font: Font.default_font,
		append_number: 'percent', // ['none', 'percent', 'count']
		color: d3.schemeSet3,
		other: {
			draw: 'graph', // ['none', 'center', 'graph']
			proportion_threshold: 0.01,
			image: Image.default_image
		},
		title: {
			text: null,
			font: Font.default_large_font
		}
	}

	constructor (options = {}) {
		super();
		this.#set_options(options);
		this.#set_helpers();
		this.#set_css();
	}

	#set_options (options) {
		options = assign_defaults(options, PieChart.default_options);

		options.margin = 10;
		options.outer_radius = 500 - options.margin;
		if (options.title.text !== null) {
			options.outer_radius -= options.title.font.size + options.margin;
		}
		
		this.options = options;
	}

	#set_helpers () {
		this.border_arc_painter = d3.arc()
			.innerRadius(this.options.inner_radius)
			.outerRadius(this.options.outer_radius);

		this.text_arc_painter = d3.arc()
			.innerRadius(this.options.outer_radius * this.options.text_distance_scale)
			.outerRadius(this.options.outer_radius);
	}

	#set_css () {
		this.css.text(`
			/* Makes the transform-origin of all text the very center */
			text {
				text-anchor: middle;
				dominant-baseline: middle;
			}

			#title {
				${(Font.to_css(this.options.title.font))}
			}

			#pie text {
				${Font.to_css(this.options.font)}
			}

			#pie path, #pie circle {
				stroke: black;
				stroke-width: 2px;
				opacity: 1;
			}
		`);
	}

	/* Data example = [
		{key: 'a', count: 50},
		{key: 'b', count: 10},
		{key: 'c', count: 3.33},
		{key: 'd', count: 23.3}
	] */
	draw (data) {
		const {bulk, other} = this.#split_data(data);

		const arcs = d3.pie().value(d => d.count)(bulk);
		const arcs_with_images = arcs.filter(e => e.data.image.href !== null);

		this.#draw_title();
		this.#draw_all_images_and_clip_paths(arcs_with_images, other);
		this.#append_pie_group();
		this.#draw_borders(arcs, other);
		this.#draw_text(arcs, other);

		return this;
	}

	#split_data (data) {
		const total_count = data.reduce((acc, e) => acc + e.count, 0);	
		const images_with_proportion = data.map(e => ({
				...e,
				proportion: e.count / total_count,
				image: assign_defaults(e.image, Image.default_image)
			}));
		
		const threshold = this.options.other.proportion_threshold;
		const above = images_with_proportion.filter(e => e.proportion > threshold);
		const below = images_with_proportion.filter(e => e.proportion <= threshold);
	
		const other_count = below.reduce((acc, e) => acc + e.count, 0);
		const other_data = {
			key: 'Other',
			count: other_count,
			proportion: other_count / total_count,
			image: this.options.other.image
		};
	
		const draw_on_graph = this.options.other.draw === 'graph';
		const draw_on_center = this.options.other.draw === 'center';
		return {
			bulk: draw_on_graph ? above.concat(other_data) : above,
			other: draw_on_center ? other_data : null
		};
	}

	#data_to_text (item) {
		const key = item.data.key;
		const count = item.data.count;
		const proportion = item.data.proportion;
		if (this.options.append_number === 'percent') {
			// TODO allow these things to be changed by options
			return `${key} ${number_to_percent(proportion, 'floor', 1)}`;
		} else if (this.options.append_number === 'count') {
			return `${key} ${count}`;
		} else if (this.options.append_number === 'none') {
			return key;
		} else {
			return key;
		}
	}

	#data_to_text_transform (item) {
		const average_angle = item.startAngle + (item.endAngle - item.startAngle) / 2
		let rotation = radians_to_degrees(average_angle);
		if (rotation < 180) {
			rotation -= 90
		} else {
			rotation += 90
		}

		const rotate = `rotate(${rotation})`;
		const translate = `translate(${this.text_arc_painter.centroid(item)})`;
		if (this.options.rotate_labels === true) {
			return translate + rotate;
		} else if (this.options.rotate_labels === false) {
			return translate;
		} else {
			return translate;
		}
	}

	#data_to_fill_color (item) {
		if (this.color_generator === undefined) {
			this.color_generator = d3.scaleOrdinal(this.options.color);
		}

		if (item.data.image.href === null) {
			return this.color_generator(item);
		} else {
			return 'none';
		}
	}

	#draw_title () {
		const text = this.options.title.text;

		const font_size = this.options.font.size;
		const margin = this.options.margin;
		const radius = this.options.outer_radius;

		if (text !== null) {
			this.svg.append('text')
				.text(text)
				.attr('id', 'title')
				.attr('transform', `
					${IMAGE_TRANSFORM}
					translate(0, ${-(radius + margin + font_size)})
				`);
		}
	}

	#draw_all_images_and_clip_paths (arcs, other) {
		const data_to_clip_id = item => `${item.data.key}-clip`;
		const data_to_clip_url = item => `url(#${data_to_clip_id(item)})`;

		this.defs.selectAll(null)
			.data(arcs)
			.join('clipPath')
				.attr('id', data_to_clip_id)
			.append('path')
				.attr('d', this.border_arc_painter)
				.attr('transform', IMAGE_TRANSFORM);

		this.svg.selectAll(null)
			.data(arcs)
			.join('g')
				.attr('clip-path', data_to_clip_url)
			.append('image')
				.attr('href', d => d.data.image.href)
				.attr('transform', d => `
					translate(${this.text_arc_painter.centroid(d)})
					${IMAGE_TRANSFORM}
					${Image.to_transform(d.data.image)}
				`);

		// If drawing the center, draw center clip path and center image 
		if (other !== null) {
			this.defs
				.append('clipPath')
					.attr('id', 'other-clip')
				.append('circle')
					.attr('r', this.options.inner_radius)
					.attr('transform', IMAGE_TRANSFORM);

			this.svg
				.append('g')
					.attr('clip-path', `url(#other-clip)`)
				.append('image')
					.attr('href', other.image.href)
					.attr('transform', `
						${IMAGE_TRANSFORM}
						${Image.to_transform(other.image)}
					`);
		}
	}

	#append_pie_group () {
		this.pie = this.svg.append('g')
			.attr('id', 'pie')
			.attr('transform', IMAGE_TRANSFORM);
	}

	#draw_borders (arcs, other) {
		const data_to_fill_color = this.#data_to_fill_color.bind(this);

		this.pie.selectAll(null)
			.data(arcs)
			.join('path')
				.attr('d', this.border_arc_painter)
				.attr('fill', data_to_fill_color);
		
		if (other !== null) {
			this.pie.append('circle')
				.attr('r', this.options.inner_radius)
				.style('fill', data_to_fill_color({data: other}));
		}
	}

	#draw_text (arcs, other) {
		const data_to_text = this.#data_to_text.bind(this);
		const data_to_text_transform = this.#data_to_text_transform.bind(this);

		this.pie.selectAll(null)
			.data(arcs)
			.join('text')
				.text(data_to_text)
				.attr('transform', data_to_text_transform);

		if (other !== null) {
			this.pie.append('text')
				.text(data_to_text({data: other}));
		}
	}
}

export default PieChart;
