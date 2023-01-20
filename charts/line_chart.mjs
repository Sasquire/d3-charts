import * as d3 from 'd3';

import { assign_defaults } from './../utils/object_utils.mjs';

import Font from './../components/font.mjs';
import Legend from './../components/legend.mjs';
import Chart from './default_chart.mjs';

class LineChart extends Chart {
	static default_options = {
		font: Font.default_small_font,
		title: {
			text: null,
			font: Font.default_large_font
		},
		x_label: {
			text: null,
			font: Font.default_font
		},
		y_label: {
			text: null,
			font: Font.default_font
		},
		color: d3.schemeCategory10,
		legend: Legend.default_legend
	}

	constructor (options = {}) {
		super();
		this.#set_options(options);
		this.#set_css();
	}

	#set_options (options) {
		options = assign_defaults(options, LineChart.default_options);

		options.margins = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 20
		};
	
		const max_size = Math.max(
			options.title.font.size,
			options.x_label.font.size,
			options.y_label.font.size
		);

		const has_label = options.title.text !== null
			|| options.x_label.text !== null
			|| options.y_label.text !== null;

		if (has_label) {
			options.margins.top += max_size;
			options.margins.right += max_size;
			options.margins.bottom += max_size;
			options.margins.left += max_size;
		}
	
		options.width = 1000 - options.margins.left - options.margins.right;
		options.height = 1000 - options.margins.top - options.margins.bottom;

		this.options = options;
	}

	#set_css () {
		this.css.text(`
			path {
				fill: none;
				stroke-width: 1.5;
			}

			text {
				${Font.to_css(this.options.font)}
			}

			#x_label {
				text-anchor: middle;
				dominant-baseline: hanging;
				${Font.to_css(this.options.x_label.font)}
			}

			#y_label {
				text-anchor: middle;
				dominant-baseline: auto;
				${Font.to_css(this.options.y_label.font)}
			}

			#title {
				text-anchor: middle;
				dominant-baseline: middle;
				${Font.to_css(this.options.title.font)}
			}
		`);
	}

	#get_stroke_color (key) {
		if (this.color_generator === undefined) {
			this.color_generator = d3.scaleOrdinal(this.options.color);
		}

		return this.color_generator(key);
	}

	/* Data example = [
		{key: 'a', x: 1, y: 1},
		{key: 'a', x: 2, y: 4},
		{key: 'a', x: 3, y: 9},
		{key: 'b', x: 1, y: 1},
		{key: 'b', x: 2, y: 2},
		{key: 'b', x: 3, y: 3},
	] */
	draw (data) {
		const data_by_keys = split_data_by_key(data, 'key');

		this.#draw_plot(data, data_by_keys);
		this.#draw_title();
		this.#draw_legend(data_by_keys);
		this.#draw_x_label();
		this.#draw_y_label();

		return this;
	}

	#draw_legend (data_by_keys) {
		const keys = Object.keys(data_by_keys);
		if (keys.length >= 2) {
			const append_legend = Legend.generate_append_legend(keys, this.options.legend);
			append_legend(this.svg, this.#get_stroke_color.bind(this));
		}
	}

	#draw_title () {
		if (this.options.title.text === null) {
			return;
		}

		this.svg.append('text')
			.text(this.options.title.text)
			.attr('id', 'title')
			.attr('transform', `translate(500, ${this.options.margins.top / 2})`);
	}

	#draw_x_label () {
		if (this.options.x_label.text === null) {
			return;
		}

		const x = this.options.margins.left + this.options.width / 2;
		const y = this.options.margins.top + this.options.height + this.options.margins.bottom / 2;

		this.svg.append('text')
			.text(this.options.x_label.text)
			.attr('id', 'x_label')
			.attr('transform', `translate(${x}, ${y})`);
	}

	#draw_y_label () {
		if (this.options.y_label.text === null) {
			return;
		}

		const x = this.options.margins.left / 2;
		const y = this.options.margins.top + this.options.height / 2;

		this.svg.append('text')
			.text(this.options.y_label.text)
			.attr('id', 'y_label')
			.attr('transform', `translate(${x}, ${y}) rotate(-90)`);
	}

	#draw_plot (data, data_by_keys) {
		// TODO x_min, x_max, y_mix, y_max
		// TODO how to allow user to change the scale (timescale, linear, log)
		const x_transform = d3.scaleTime()
			.domain(d3.extent(data.map(e => e.x)))
			.range([this.options.margins.left, this.options.width]);

		const y_transform = d3.scaleLinear()
			.domain(d3.extent(data.map(e => e.y)))
			.range([this.options.height + this.options.margins.bottom, this.options.margins.bottom]);

		const line_function = d3.line()
			.x(d => x_transform(d.x))
			.y(d => y_transform(d.y));

		// Draw Lines
		for (const [key, value] of Object.entries(data_by_keys)) {
			this.svg.append('path')
				.datum(value)
				.attr('stroke', this.#get_stroke_color.bind(this)(key))
				.attr('d', line_function);
		}

		// Draw X axis
		this.svg.append('g')
			.attr('transform', `translate(0, ${this.options.margins.top + this.options.height})`)
			.call(d3.axisBottom(x_transform).tickFormat(d3.timeFormat('%Y')));
		
		// Draw Y axis
		this.svg.append('g')
			.attr('transform', `translate(${this.options.margins.left}, 0)`)
			.call(d3.axisLeft(y_transform));
	}
}

function split_data_by_key (data, key_attribute) {
	const data_by_keys = {};
	for (const value of data) {
		const key_name = value[key_attribute] === undefined ? 'undefined' : value.key.toString();
		if (data_by_keys[key_name] === undefined) {
			data_by_keys[key_name] = [];
		}
		data_by_keys[key_name].push(value);
	}
	return data_by_keys;
}

export default LineChart;
