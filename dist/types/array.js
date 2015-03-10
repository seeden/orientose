"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Type = _interopRequire(require("./type"));

var Schema = _interopRequire(require("../schemas/index"));

var ArrayType = (function (Type) {
	function ArrayType(data, options) {
		_classCallCheck(this, ArrayType);

		_get(Object.getPrototypeOf(ArrayType.prototype), "constructor", this).call(this, data, options);

		if (!options.type) {
			throw new Error("Type of the array item is not defined");
		}

		this._itemSchemaType = options.type.schemaType;
		this._itemOptions = options.type.options;

		this._value = [];
	}

	_inherits(ArrayType, Type);

	_prototypeProperties(ArrayType, {
		getDbType: {
			value: function getDbType(options) {
				return "EMBEDDEDLIST";
			},
			writable: true,
			configurable: true
		},
		getPropertyConfig: {
			value: function getPropertyConfig(options) {
				var item = options.type;

				return {
					linkedType: item.schemaType.getDbType(item.options)
				};
			},
			writable: true,
			configurable: true
		}
	}, {
		_createItem: {
			value: function _createItem(value) {
				var item = new this._itemSchemaType(this.data, this._itemOptions);
				item.value = value;

				return item;
			},
			writable: true,
			configurable: true
		},
		_empty: {
			value: function _empty() {
				this._value = [];
			},
			writable: true,
			configurable: true
		},
		_serialize: {
			value: function _serialize(items) {
				var _this = this;

				this._empty();

				items.forEach(function (item) {
					_this.push(item);
				});

				return this._value;
			},
			writable: true,
			configurable: true
		},
		_deserialize: {
			value: function _deserialize() {
				return this;
			},
			writable: true,
			configurable: true
		},
		set: {
			value: function set(index, value) {
				return this._value[index] = this._createItem(value);
			},
			writable: true,
			configurable: true
		},
		push: {
			value: function push(value) {
				return this._value.push(this._createItem(value));
			},
			writable: true,
			configurable: true
		},
		pop: {
			value: function pop() {
				var item = this._value.pop();
				return item ? item.value : item;
			},
			writable: true,
			configurable: true
		},
		toJSON: {
			value: function toJSON(options) {
				return this._value.map(function (item) {
					return item.toJSON(options);
				});
			},
			writable: true,
			configurable: true
		},
		isModified: {
			get: function () {
				var jsonCurrent = JSON.stringify(this.toJSON());
				var jsonOriginal = JSON.stringify(this.original);
				return jsonCurrent === jsonOriginal;
			},
			configurable: true
		}
	});

	return ArrayType;
})(Type);

module.exports = ArrayType;