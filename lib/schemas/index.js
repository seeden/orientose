import {EventEmitter} from 'events';
import Kareem from 'kareem';
import _ from 'lodash';
import VirtualType from '../types/virtual';
import Data from '../data';
import convertType from '../types/convert';
//import normalizeOptions from '../types/normalize';

/*
{
	extend: 'V'
}
*/

export default class Schema extends EventEmitter {
	constructor(props, options) {
		super();

		props = props || {};

		this.methods   = {};
		this.statics   = {};

		this._props    = {};
		this._options  = options || {};

		this._paths    = {};
		this._indexes  = {};
		this._virtuals = {};
		this._hooks    = new Kareem();

		this._dataClass = null;

		this.add(props);
	}

	get extendClassName() {
		return this._options.extend;
	}

	get hooks() {
		return this._hooks;
	}

	get DataClass() {
		if(!this._dataClass) {
			this._dataClass = Data.createClass(this);
		}

		return this._dataClass;
	}

	add(props) {
		if(!_.isObject(props)) {
			throw new Error('Props is not an object');
		}

		for(var propName in props) {
			this.set(propName, props[propName]);
		}

		return this;
	}

	get(property) {
		return this._props[property].options;
	}

	getSchemaType(property) {
		return this._props[property].schemaType;
	}

	set(propName, options) {
		this._props[propName] = Schema.normalizeOptions(options);

		return this;
	}

	has(property) {
		return !!this._props[property];
	}

	propertyNames() {
		return Object.keys(this._props);
	}

	static(name, fn) {
		if(_.isObject(name)) {
			for (var index in name) {
				this.statics[index] = name[index];
			}
			return;
		}

		this.statics[name] = fn;
		return this;
	}

	method(name, fn) {
		if(_.isObject(name)) {
			for (var index in name) {
				this.methods[index] = name[index];
			}
			return;
		}

		this.methods[name] = fn;
		return this;
	}

	virtual(name, options) {
		options = options || {};

		if(name.indexOf('.') !== -1) {
			throw new Error('You can not set virtual method for subdocument in this way. Please use subschemas.');
		}

		if(!this._virtuals[name]) {
			this._virtuals[name] = {
				schemaType : VirtualType,
				options    : options,
				getset     : {
					get: function(fn) {
						options.get = fn;
					},
					set: function(fn) {
						options.set = fn;
					}
				}
			}
		}

		return this._virtuals[name].getset;
	}

	pre(name, async, fn) {
		this._hooks.pre(name, async, fn);
		return this;
	}

	post(name, async, fn) {
		this._hooks.post(name, async, fn);
		return this;
	}

	traverse(fn) {
		var props    = this._props;
		var virtuals = this._virtuals;

		for(var name in props) {
			if(!props.hasOwnProperty(name)) {
				continue;
			}

			fn(name, props[name]);
		}

		//traverse virtual poroperties
		for(var name in virtuals) {
			if(!virtuals.hasOwnProperty(name)) {
				continue;
			}

			fn(name, virtuals[name]);
		}		

		return this;
	}

	plugin(pluginFn, options) {
		options = options || {};

		pluginFn(this, options);
		return this;
	}

	get isSchema() {
		return true;
	}

	static normalizeOptions(options) {
		//1. convert objects
		if(!options.type && _.isPlainObject(options)) {
			options = { 
				type: options
			};
		}

		//2. prepare array
		if(_.isArray(options)) {
			options = {
				type: options
			};
		}

		options.type = Schema.normalizeType(options.type);

		return {
			schemaType: convertType(options.type),
			options: options
		};
	}

	static normalizeType(type) {
		//automatically prepare schema for plain objects
		if(_.isPlainObject(type)) {
			type = new Schema(type);
		}

		if(_.isArray(type)) {
			if(!type.length) {
				type = [String]; //default type is String
			} else if(type.length !== 1) {
				throw new Error('Type of an array item is undefined');
			}

			var itemOptions = type[0];
			if(!_.isPlainObject(itemOptions)) {
				itemOptions = {
					type: itemOptions
				};
			}

			type = [Schema.normalizeOptions(itemOptions)];
		}

		return type;
	}
}