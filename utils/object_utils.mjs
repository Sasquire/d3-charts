function is_object (value) {
	return value && typeof value === 'object' && value.constructor === Object;
}

function assign_defaults (object, defaults_values) {
	if (object === undefined) {
		return duplicate_object(defaults_values);
	}

	for (const key of Object.keys(defaults_values)) {
		const default_value = defaults_values[key];
		
		if (object[key] === undefined) {
			object[key] = default_value;
		} else if (is_object(default_value)) {
			object[key] = assign_defaults(object[key], default_value);	
		} else {
			// Do nothing because the value is set
		}
	}

	return object;
}

function duplicate_object (object, changes = {}) {
	const new_object = structuredClone(object);
	if (is_object(changes)) {
		for (const key of Object.keys(changes)) {
			new_object[key] = changes[key]
		}
	}
	return new_object;
}

export {
	is_object,
	assign_defaults,
	duplicate_object
};
