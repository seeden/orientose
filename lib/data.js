import Schema from './schemas/index';
import _ from 'lodash';
import VirtualType from './types/virtual';

export default class Data {
	constructor(schema, fields) {
		this._schema = schema;
		this._data = {};	

		schema.traverse((propName, prop) => {
			this._data[propName] = new prop.schemaType(this, prop.options);
		});	
	}

	toJSON(options) {
		var json = {};

		options = options || {};

		for(var propName in this._data) {
			var prop = this._data[propName];
			if(prop instanceof VirtualType && !options.virtuals) {
				continue;
			}

			json[propName] = this._data[propName].toJSON();
		}

		return json;
	}

	get (key) {
		return this._data[key].value;
	}

	set (key, value, original) {
		if(_.isObject(key)) {
			for(var name in key) {
				this.set(name, key[name], original);
			}
			return this;
		}

		if(!this._data[key]) {
			return this;
		}

		this._data[key].value = value;
		if(original) {
			this._data[key].setAsOriginal();
		}

		return this;
	}

	setupData(fields) {
		this.set(fields, null, true);
	}

	static createClass(schema) {
		class DataClass extends Data {
			constructor (fields, callback) {
				super(schema, fields);
				this._callback = callback || function() {};
			}
		};

		//define properties
		schema.traverse(function(fieldName) {
			Object.defineProperty(DataClass.prototype, fieldName, {
				enumerable: true,
				configurable: true,
				get: function () {
					return this.get(fieldName);
				},
				set: function(value) {
					return this.set(fieldName, value);
				}
			});
		});

		return DataClass;
	}
}