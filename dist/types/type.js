"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Type = (function () {
	function Type(data, prop) {
		_classCallCheck(this, Type);

		if (!data || !prop) {
			throw new Error("Data or prop is undefined");
		}

		var options = prop.options || {};

		this._data = data;
		this._prop = prop;
		this._options = options;

		this._default = options["default"];
		this._value = void 0;
		this._original = void 0;
	}

	_createClass(Type, {
		data: {
			get: function () {
				return this._data;
			}
		},
		original: {
			get: function () {
				return this._original;
			}
		},
		options: {
			get: function () {
				return this._options;
			}
		},
		prop: {
			get: function () {
				return this._prop;
			}
		},
		isMetadata: {
			get: function () {
				return !!this.options.metadata;
			}
		},
		value: {
			set: function (value) {
				this._value = this._serialize(value);
			},
			get: function () {
				var value = this._deserialize(this._value);
				if (typeof value !== "undefined") {
					return value;
				}

				var defaultValue = this._default;
				if (typeof defaultValue === "function") {
					defaultValue = defaultValue();
				}

				return this._deserialize(this._serialize(defaultValue));
			}
		},
		_serialize: {
			value: function _serialize(value) {
				throw new Error("You need to override _serialize");
			}
		},
		_deserialize: {
			value: function _deserialize(value) {
				throw new Error("You need to override _deserialize");
			}
		},
		setAsOriginal: {
			value: function setAsOriginal() {
				this._original = this.value;
				return this;
			}
		},
		rollback: {
			value: function rollback() {
				if (this.options.readonly) {
					return;
				}

				this.value = this.original;
				return this;
			}
		},
		isModified: {
			get: function () {
				return this.original !== this.value;
			}
		},
		setupData: {
			value: function setupData(data) {
				this._value = this._serialize(data);
				this._original = this.value;

				//parent.childChanged(this);
			}
		},
		toJSON: {
			value: function toJSON() {
				return this.value;
			}
		}
	}, {
		toString: {
			value: function toString() {
				throw new Error("Method toString is not defined");
			}
		},
		getDbType: {
			value: function getDbType(options) {
				throw new Error("You need to override getter dbType");
			}
		},
		isSchemaType: {
			get: function () {
				return true;
			}
		},
		getPropertyConfig: {
			value: function getPropertyConfig(options) {
				return {};
			}
		}
	});

	return Type;
})();

module.exports = Type;