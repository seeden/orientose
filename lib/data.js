import Schema from './schema';
import _ from 'lodash';

export default class Data {
	constructor(schema, fields) {
		this._schema = schema;
		this._data = {};	

		schema.traverse((propName, prop) => {
			this._data[propName] = new prop.type(prop.options);
		});	
	}

	get (key) {
		return this._data[key].value;
	}

	set (key, value) {
		if(_.isObject(key)) {
			for(var name in key) {
				this.set(name, key[name]);
			}
			return this;
		}

		this._data[key].value = value;
		return this;
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