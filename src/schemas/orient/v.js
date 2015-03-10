import OrientSchema from './index';

export default class V extends OrientSchema {
	constructor(props, options) {
		options = options || {};
		options.extend = options.extend || 'V';
		super(props, options);
	}

	get isVertex() {
		return true;
	}
}