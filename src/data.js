import Schema from './schemas/index';
import _ from 'lodash';
import VirtualType from './types/virtual';

export default class Data {
	constructor(schema, properties) {
		properties = properties || {};

		this._schema = schema;
		this._data = {};	

		schema.traverse((propName, prop) => {
			this._data[propName] = new prop.schemaType(this, prop.options);
		});	

		this.set(properties);
	}

	toJSON(options) {
		var json = {};

		options = options || {};

		for(var propName in this._data) {
			var prop = this._data[propName];
			if(prop instanceof VirtualType && !options.virtuals) {
				continue;
			}

			if(options.metadata === false && prop.isMetadata) {
				continue;
			}

			json[propName] = prop.toJSON(options);
		}

		return json;
	}

	get (path) {
		var pos = path.indexOf('.');
		if(pos === -1) {
			return this._data[path].value;
		}

		var currentKey = path.substr(0, pos);
		var newPath = path.substr(pos + 1);

		var data = this._data[currentKey].value;
		if(!data || !data.get) {
			throw new Error('Subdocument is not defined or it is not an object');
		}

		return data.get(newPath);
	}

	set (path, value, setAsOriginal) {
		if(_.isPlainObject(path)) {
			for(var key in path) {
				this.set(key, path[key], setAsOriginal);
			}
			return this;
		}

		var pos = path.indexOf('.');
		if(pos === -1) {
			var property = this._data[path];
			if(!property) {
				console.log('Path not exists:' + path);
				return this;
			}
			

			property.value = value;
			if(setAsOriginal) {
				property.setAsOriginal();
			}
			return this;
		}

		var currentKey = path.substr(0, pos);
		var newPath = path.substr(pos + 1);

		var data = this._data[currentKey].value;
		if(!data || !data.set) {
			throw new Error('Subdocument is not defined or it is not an object');
		}

		data.set(newPath, value, setAsOriginal);
		return this;


/*
		if(!this._data[key]) {
			return this;
		}

		this._data[key].value = value;
		if(original) {
			this._data[key].setAsOriginal();
		}

		return this;*/
	}

	setupData(properties) {
		this.set(properties, null, true);
	}

	static createClass(schema) {
		class DataClass extends Data {
			constructor (properties, callback) {
				super(schema, properties);
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