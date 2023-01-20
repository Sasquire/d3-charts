function radians_to_degrees (rad) {
	return rad * 180 / Math.PI;
}

function degrees_to_radians (deg) {
	return deg * Math.PI / 180;
}

// TODO more rounding methods
// https://en.wikipedia.org/wiki/Rounding#Types_of_rounding
function number_to_percent(number, rounding, decimals) {
	number *= 100;
	number *= Math.pow(10, decimals);

	if (rounding === 'ceil') {
		number = Math.ceil(number);
	} else if (rounding === 'floor') {
		number = Math.floor(number);
	} else if (rounding === 'round') {
		number = Math.round(number);
	} else if (rounding === 'none') {
		// Do nothing
	} else {
		// Do nothing
	}

	number /= Math.pow(10, decimals);

	return `${number.toFixed(decimals)}%`;
}

export {
	number_to_percent,
	radians_to_degrees,
	degrees_to_radians
};
