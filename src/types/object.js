import Type from './type';
import _ from 'lodash';

export default class ObjectType extends Type {
	constructor(data, prop, name, mainData) {
		super(data, prop, name, mainData);

		this._schema = prop.type;

		this._value = new this._schema.DataClass({}, this._computeClassName(data, prop), mainData);
	}

	_computeClassName(data, prop) {
		var schemaType = prop.schemaType;
		var options = prop.options;
		var className = data._className;
		var type = schemaType.getDbType(options);
		var propType = prop.type;
		if (propType._options.className || options.className) {
			return propType._options.className || options.className;
		}
		if(type === 'EMBEDDED' && schemaType.isObject) {
			return className + 'A' + _.capitalize(this.name);
		} else if(type === 'EMBEDDEDLIST' && schemaType.isArray && prop.item) {
			var item = prop.item;
			if(item.schemaType.isObject) {
				return className + 'A' + _.capitalize(propName);
			}
		}

		return;
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

	toObject(options) {
		return this._value.toObject(options);
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