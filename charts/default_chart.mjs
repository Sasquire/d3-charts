import * as d3 from 'd3';
import { JSDOM } from 'jsdom';
import fs from 'fs';

function get_body () {
	// if node return jsdom body
	// if browser return actual body
	const dom = new JSDOM('<!DOCTYPE html><body></body>');
	const body = d3.select(dom.window.document.querySelector('body'));
	return body;
}

function new_svg (body) {
	const svg = body
		.append('svg')
		.attr('viewBox', '0 0 1000 1000')
		.attr('xmlns', 'http://www.w3.org/2000/svg');

	const defs = svg.append('defs');
	const css = svg.append('style');

	return {
		svg: svg, 
		defs: defs,
		css: css
	};
}

class Chart {
	constructor () {
		const body = get_body();
		const {svg, defs, css} = new_svg(body);

		this.body = body;
		this.svg = svg;
		this.defs = defs;
		this.css = css;
	}

	save (file_path) {
		fs.writeFileSync(file_path, this.body.html());
	}
}

export default Chart;