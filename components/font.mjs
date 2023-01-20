import { duplicate_object } from './../utils/object_utils.mjs';

class Font {
	static default_font = {
		size: 24,
		family: null,
		color: 'black',
		border: 'white',
		border_size: 5
	};
	
	static default_large_font = duplicate_object(Font.default_font, {
		size: 48
	});
	
	static default_small_font = duplicate_object(Font.default_font, {
		size: 12,
		border_size: 2
	});

	static to_css (options) {
		return `
			font-size: ${options.size}px;
			${options.family === null ? '' : `font-family: ${options.family};` }

			paint-order: stroke;
			stroke: ${options.border};
			fill: ${options.color};
			stroke-width: ${options.border_size}px;
		`;
	}
}

export default Font;
