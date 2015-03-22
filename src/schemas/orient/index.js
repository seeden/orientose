import Schema from '../index';
import RID from '../../types/rid';
import ObjectId from '../mongoose/objectid';

export function prepareSchema(schema) {
	schema.add({
		'@type'    : { type: String, readonly: true, metadata: true },
		'@class'   : { type: String, readonly: true, metadata: true },
		'@rid'     : { type: RID, readonly: true, metadata: true },
		'@version' : { type: Number, readonly: true, metadata: true },
	});

	schema.virtual('rid', { metadata: true }).get(function() {
		return this.get('@rid');
	});

	schema.virtual('_id', { metadata: true }).get(function() {
		var rid = this.get('@rid');

		if(rid) {
			return new ObjectId(rid);
		}

		return rid;
	});	
}

export default class OrientSchema extends Schema {
	constructor(props, options) {
		super(props, options);

		prepareSchema(this);
	}
}