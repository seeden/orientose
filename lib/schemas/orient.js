import Schema from './index';
import RID from '../types/rid';

export default class SchemaOrient extends Schema {
	constructor(props, options) {
		super(props, options);

		this.add({
			'@type'  : { type: String, readonly: true, exclude: true },
			'@class' : { type: String, readonly: true, exclude: true },
			'@rid'   : { type: RID, readonly: true, exclude: true }
		});

		this.virtual('rid').get(function() {
			return this['@rid'];
		});
	}
}