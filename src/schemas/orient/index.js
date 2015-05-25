import Schema from '../index';
import RID from '../../types/rid';
import ObjectId from '../mongoose/objectid';

function getDefaultClassName() {
	return this._className;
}

export function prepareSchema(schema) {
	schema.add({
		'@type'    : { type: String, readonly: true, metadata: true, query: true, default: 'document' },
		'@class'   : { type: String, readonly: true, metadata: true, query: true, default: getDefaultClassName},
		'@rid'     : { type: RID, readonly: true, metadata: true },
		'version' : { type: Number, readonly: true, metadata: true },
	});

	schema.virtual('rid', { metadata: true }).get(function() {
		return this.get('@rid');
	});

	var _id = schema.virtual('_id', { metadata: true });
	var version = schema.virtual('@version', { metadata: true });
	version.get(function(){
		return this.get('version')
	})

	_id.get(function() {
		return this.get('@rid');
	});
	_id.set(function(id){
		return this.set('@rid');
	})
	var id = schema.virtual('id', { metadata: true });
	id.get(function() {
		return this.get('@rid').toString().substr(1);
	});
	id.set(function(id){
		if ( id[0] !== "#") {
			id = "#"+id;
		}
		return this.set('@rid', id)
	})
}

export default class OrientSchema extends Schema {
	constructor(props, options) {
		super(props, options);

		prepareSchema(this);
	}

	getSubdocumentSchemaConstructor() {
		return OrientSchema;
	}
}