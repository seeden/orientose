import Schema from '../index';
import RID from '../../types/rid';

class ObjectId {
	constructor(id) {
		this._value = id;
	}

	toString() {
		return this._value;
	}

	equals(id) {
		return id && this.toString() === id.toString();
	}
}

export default class OrientSchema extends Schema {
	constructor(props, options) {
		super(props, options);

		this.add({
			'@type'    : { type: String, readonly: true, metadata: true },
			'@class'   : { type: String, readonly: true, metadata: true },
			'@rid'     : { type: RID, readonly: true, metadata: true },
			'@version' : { type: Number, readonly: true, metadata: true },
		});

		this.virtual('rid', { metadata: true }).get(function() {
			return this.get('@rid');
		});

		this.virtual('_id', { metadata: true }).get(function() {
			var rid = this.get('@rid');

			if(rid) {
				return new ObjectId(rid);
			}

			return rid;
		});
	}
}