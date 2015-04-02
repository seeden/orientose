import OrientSchema, { prepareSchema } from './index';
import VertexSchema from '../vertex';

export default class V extends VertexSchema {
	constructor(props, options) {
		options = options || {};
		options.extend = options.extend || 'V';

		super(props, options);
		var self = this;
		prepareSchema(this);
	}
}