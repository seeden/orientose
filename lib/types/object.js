import Type from './type';

export default class ObjectType extends Type {
	constructor(data, options) {
		super(data, options);

		this._schema = options.type;
		this._value = new this._schema.DataClass();
	}

	set(key, value) {
		this._value[key] = value;
	}

	_serialize(props) {
		for(var propName in props) {
			this.set(propName, props[propName]);
		}
		return this._value;
	}

	_deserialize() {
		return this._value;
	}

	toJSON(options) {
		return this._value.toJSON(options);
	}

	get isModified() {
		var jsonCurrent = JSON.stringify(this.toJSON());
		var jsonOriginal = JSON.stringify(this.original);
		return jsonCurrent === jsonOriginal;
	}	

	static getDbType(options) {
		return 'EMBEDDED';
	}
}