import Type from './type';

export default class ObjectType extends Type {
	constructor(data, prop) {
		super(data, prop);

		this._schema = prop.type;
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
		var isModified = false;

		this._value.forEach(true, function(prop) {
			if(prop.isModified) {
				isModified = true;
			}
		});

		return isModified;
	}	

	static getDbType(options) {
		return 'EMBEDDED';
	}

	static toString() {
		return 'Object';
	}		

	static get isObject() {
		return true;
	}
}