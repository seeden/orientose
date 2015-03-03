import Schema from '../index';
import RID from '../../types/rid';

export default class SchemaOrient extends Schema {
	constructor(props, options) {
		super(props, options);

		this.add({
			'@type'    : { type: String, readonly: true, metadata: true },
			'@class'   : { type: String, readonly: true, metadata: true },
			'@rid'     : { type: RID, readonly: true, metadata: true },
			'@version' : { type: Number, readonly: true, metadata: true },
		});

		this.virtual('rid', { metadata: true }).get(function() {
			return this['@rid'];
		});
	}
}