"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Schema = _interopRequire(require("./schemas/index"));

var _ = _interopRequire(require("lodash"));

var VirtualType = _interopRequire(require("./types/virtual"));

var Data = (function () {
	function Data(schema, properties) {
		var _this = this;

		_classCallCheck(this, Data);

		properties = properties || {};

		this._schema = schema;
		this._data = {};

		schema.traverse(function (propName, prop) {
			_this._data[propName] = new prop.schemaType(_this, prop.options);
		});

		this.set(properties);
	}

	_prototypeProperties(Data, {
		createClass: {
			value: function createClass(schema) {
				var DataClass = (function (Data) {
					function DataClass(properties, callback) {
						_classCallCheck(this, DataClass);

						_get(Object.getPrototypeOf(DataClass.prototype), "constructor", this).call(this, schema, properties);
						this._callback = callback || function () {};
					}

					_inherits(DataClass, Data);

					return DataClass;
				})(Data);

				;

				//define properties
				schema.traverse(function (fieldName) {
					Object.defineProperty(DataClass.prototype, fieldName, {
						enumerable: true,
						configurable: true,
						get: function get() {
							return this.get(fieldName);
						},
						set: function set(value) {
							return this.set(fieldName, value);
						}
					});
				});

				return DataClass;
			},
			writable: true,
			configurable: true
		}
	}, {
		toJSON: {
			value: function toJSON(options) {
				var json = {};

				options = options || {};

				for (var propName in this._data) {
					var prop = this._data[propName];
					if (prop instanceof VirtualType && !options.virtuals) {
						continue;
					}

					if (options.metadata === false && prop.isMetadata) {
						continue;
					}

					json[propName] = prop.toJSON(options);
				}

				return json;
			},
			writable: true,
			configurable: true
		},
		get: {
			value: function get(path) {
				var pos = path.indexOf(".");
				if (pos === -1) {
					return this._data[path].value;
				}

				var currentKey = path.substr(0, pos);
				var newPath = path.substr(pos + 1);

				var data = this._data[currentKey].value;
				if (!data || !data.get) {
					throw new Error("Subdocument is not defined or it is not an object");
				}

				return data.get(newPath);
			},
			writable: true,
			configurable: true
		},
		set: {
			value: function set(path, value, setAsOriginal) {
				if (_.isPlainObject(path)) {
					for (var key in path) {
						this.set(key, path[key], setAsOriginal);
					}
					return this;
				}

				var pos = path.indexOf(".");
				if (pos === -1) {
					var property = this._data[path];
					if (!property) {
						console.log("Path not exists:" + path);
						return this;
					}

					property.value = value;
					if (setAsOriginal) {
						property.setAsOriginal();
					}
					return this;
				}

				var currentKey = path.substr(0, pos);
				var newPath = path.substr(pos + 1);

				var data = this._data[currentKey].value;
				if (!data || !data.set) {
					throw new Error("Subdocument is not defined or it is not an object");
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
			},
			writable: true,
			configurable: true
		},
		setupData: {
			value: function setupData(properties) {
				this.set(properties, null, true);
			},
			writable: true,
			configurable: true
		}
	});

	return Data;
})();

module.exports = Data;