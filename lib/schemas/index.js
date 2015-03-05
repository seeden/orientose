import {EventEmitter} from 'events';
import Kareem from 'kareem';
import _ from 'lodash';
import VirtualType from '../types/virtual';
import Data from '../data';
import convertType from '../types/convert';
import MixedType from '../types/mixed';
import IndexType from '../constants/indextype';

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

	_indexName(properties) {
		var props = Object.keys(properties).map(function(prop) {
			return prop.replace('.', '-')
		});

		return props.join('_');
	}


	index(properties, options) {
		options = options || {};

		if(typeof properties === 'string') {
			properties = { [properties]: 1 };
		}

		var name = options.name || this._indexName(properties);
		var type = options.type || IndexType.NOTUNIQUE;
		if(options.unique) {
			type = IndexType.UNIQUE;
		} else if(options.text) {
			type = IndexType.FULLTEXT;
		}

		if(this._indexes[name]) {
			throw new Error('Index with name ${name} is already defined.');
		}

		//fix 2dsphere index from mongoose
		if(type.toUpperCase() === '2DSPHERE') {
			type = 'SPATIAL ENGINE LUCENE';

			var keys = Object.keys(properties);
			if(keys.length !== 1) {
				throw new Error('We can not fix index on multiple properties');
			}

			properties = {
				[keys[0] + '.coordinates']: 1
			};
		}

		this._indexes[name] = {
			properties: properties,
			type: type,
			nullValuesIgnored: !options.sparse,
			options: options
		};

		return this;
	}

	hasIndex(name) {
		return !!this._indexes[name];
	}

	getIndex(name) {
		return this._indexes[name];
	}

	get indexNames() {
		return Object.keys(this._indexes);
	}

	/**
	*/

	get(propName) {
		var pos = propName.indexOf('.');
		if(pos === -1) {
			if(!this._props[propName]) {
				return;
			}

			return this._props[propName].options;
		}

		var nextPath = propName.substr(pos + 1);
		propName = propName.substr(0, pos);

		var prop = this._props[propName];
		if(!prop) {
			return;
		}

		var type = prop.options.type;
		if(!type.isSchema) {
			return;
		}

		return type.get(nextPath);
	}

	getSchemaType(property) {
		return this._props[property].schemaType;
	}	

	set(propName, options) {
		options = options || {};
		
		var pos = propName.indexOf('.');
		if(pos === -1) {
			this._props[propName] = Schema.normalizeOptions(options);

			if(!options.index)  {
				return this;
			}

			this.index({
				[propName]: propName
			}, {
				name   : options.indexName,
				unique : options.unique,
				sparse : options.sparse,
				type   : options.indexType 
			});

			return this;
		}

		var nextPath = propName.substr(pos + 1);
		propName = propName.substr(0, pos);

		var prop = this._props[propName];
		if(!prop) {
			return;
		}

		var type = prop.options.type;
		if(!type.isSchema) {
			return;
		}

		return type.set(nextPath, options);		

	}

	has(property) {
		return !!this._props[property];
	}

	propertyNames() {
		return Object.keys(this._props);
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

	static (name, fn) {
		if(_.isObject(name)) {
			for (var index in name) {
				this.statics[index] = name[index];
			}
			return;
		}

		this.statics[name] = fn;
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
						return this;
					},
					set: function(fn) {
						options.set = fn;
						return this;
					}
				}
			}
		}

		return this._virtuals[name].getset;
	}

	alias(to, from) {
		this.virtual(from).get(function(){
			return this[to];
		}).set(function(value){
			this[to] = value;
		});

		return this;
	}

	pre(name, async, fn) {
		this._hooks.pre(name, async, fn);
		return this;
	}

	post(name, async, fn) {
		this._hooks.post(name, async, fn);
		return this;
	}

	traverse(fn, traverseChildren, skipObjects, parentPath) {
		var props    = this._props;
		var virtuals = this._virtuals;


		for(var name in props) {
			if(!props.hasOwnProperty(name)) {
				continue;
			}

			var prop = props[name];
			var currentPath = parentPath ?  parentPath + '.' + name : name;
			var propType = prop.options.type;
			var isSchema = propType && propType.isSchema;

			fn(name, prop, currentPath, false);

			if(traverseChildren && isSchema) {
				propType.traverse(fn, traverseChildren, skipObjects, currentPath);
			}
		}

		//traverse virtual poroperties
		for(var name in virtuals) {
			if(!virtuals.hasOwnProperty(name)) {
				continue;
			}

			var prop = virtuals[name];
			var currentPath = parentPath ?  parentPath + '.' + name : name;

			fn(name, prop, currentPath, true);
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

	path(path, options) {
		if(typeof this.options !== 'undefined') {
			this.set(path, options);
			return this;
		} 

		return this.get(path).type;
	}

	eachPath(fn) {
		this.traverse(function(name, prop, path, isVirtual) {
			var options = prop.options;
			var type = options.type;

			var config = {
				options: options
			};

			if(type.isSchema) {
				config.schema = options.type;
			}

			fn(path, config);
		});
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
				type = [MixedType]; 
			} else if(type.length !== 1) {
				throw new Error('Type of an array item is undefined');
			}

			var itemOptions = type[0];
			if(!_.isPlainObject(itemOptions)) {
				itemOptions = {
					type: itemOptions
				};
			}

			var normalisedOptions = Schema.normalizeOptions(itemOptions);
			type.schemaType = normalisedOptions.schemaType;
			type.options = normalisedOptions.options;
		}

		return type;
	}
}