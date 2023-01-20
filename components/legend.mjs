import Font from "./font.mjs";

function get_y (options, i) {
	return options.y + i * (options.font.size + options.spacing)
}

class Legend {
	static default_legend = {
		font: Font.default_font,
		spacing: 4,
		x: 150,
		y: 150
	} 

	// TODO I don't think this is the best way to do a legend
	static generate_append_legend (keys, options) {
		return function append_legend (svg, key_to_color) {
			const legend_svg = svg
				.selectAll(null)
				.data(keys);
			
			// Make color indicators
			legend_svg.join('rect')
				.attr('width', options.font.size)
				.attr('height', options.font.size)
				.attr('transform', (d, i) => `translate(${options.x}, ${get_y(options, i)})`)
				.style('fill', key => key_to_color(key))
			
			// Add text
			legend_svg.join('text')
				.text(key => key)
				.attr('transform', (d, i) => {
					const x = options.x + options.font.size + options.spacing;
					// Have to add extra because the transform-origin is the bottom left by default.
					const y = get_y(options, i) + options.font.size / 2;
					return `translate(${x}, ${y})`;
				})
				.attr('style', `
					dominant-baseline: middle;
					${Font.to_css(options.font)}
				`);
		}
	}
}

export default Legend;
