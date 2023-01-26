import {
	scaleLinear,
	scalePow,
	scaleSqrt,
	scaleLog,
	scaleSymlog,
	scaleIdentity,
	scaleTime,

	extent
} from 'd3';

class Scale {
	static default_scale = {
		type: 'linear',
		min: null, // defaults to data
		max: null // defaults to data
	} 

	static to_d3 (options, values) {
		let [min, max] = extent(values);

		if (options.min !== null) {
			min = options.min;
		}
		if (options.max !== null) {
			max = options.max
		}

		if ((options.type === 'log' || options.type === 'symlog') && min <= 0) {
			throw new Error('bad minimum value with log scale');
		}
		if (options.type === 'sqrt' && min < 0) {
			throw new Error('bad minimum value with sqrt scale');
		}

		const type = {
			'linear': scaleLinear,
			'pow': scalePow,
			'sqrt': scaleSqrt,
			'log': scaleLog,
			'symlog': scaleSymlog,
			'identity': scaleIdentity,
			'time': scaleTime,
		}[options.type];

		if (type === undefined) {
			throw new Error('bad option "type"');
		}

		return type().domain([min, max]);
	}
}

export default Scale;
