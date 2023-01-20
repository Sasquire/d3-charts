class Image {
	static default_image = {
		href: null,
		x: 0,
		y: 0,
		scale: 1,
		scale_x: 1,
		scale_y: 1,
		rotation: 0, // Degrees
		flip: false
	};

	static to_transform (options) {		
		const scale_x = options.scale * options.scale_x * (options.flip ? -1 : 1);
		const scale_y = options.scale * options.scale_y;
		return `
			scale(${scale_x}, ${scale_y})
			rotate(${options.rotation})
			translate(${-options.x}, ${-options.y})
		`;
	}
}

export default Image;
