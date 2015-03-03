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

	static get dbType() {
		return 'EMBEDDED';
	}
}