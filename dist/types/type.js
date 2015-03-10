"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Type = (function () {
	function Type(data, options) {
		_classCallCheck(this, Type);

		options = options || {};

		this._data = data;
		this._options = options;

		this._default = options["default"];
		this._value = void 0;
		this._original = void 0;
	}

	_prototypeProperties(Type, {
		getDbType: {
			value: function getDbType(options) {
				throw new Error("You need to override getter dbType");
			},
			writable: true,
			configurable: true
		},
		isSchemaType: {
			get: function () {
				return true;
			},
			configurable: true
		},
		getPropertyConfig: {
			value: function getPropertyConfig(options) {
				return {};
			},
			writable: true,
			configurable: true
		}
	}, {
		data: {
			get: function () {
				return this._data;
			},
			configurable: true
		},
		original: {
			get: function () {
				return this._original;
			},
			configurable: true
		},
		options: {
			get: function () {
				return this._options;
			},
			configurable: true
		},
		isMetadata: {
			get: function () {
				return !!this.options.metadata;
			},
			configurable: true
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
			},
			configurable: true
		},
		_serialize: {
			value: function _serialize(value) {
				throw new Error("You need to override _serialize");
			},
			writable: true,
			configurable: true
		},
		_deserialize: {
			value: function _deserialize(value) {
				throw new Error("You need to override _deserialize");
			},
			writable: true,
			configurable: true
		},
		setAsOriginal: {
			value: function setAsOriginal() {
				this._original = this.value;
				return this;
			},
			writable: true,
			configurable: true
		},
		rollback: {
			value: function rollback() {
				if (this.options.readonly) {
					return;
				}

				this.value = this.original;
				return this;
			},
			writable: true,
			configurable: true
		},
		isModified: {
			get: function () {
				return this.original !== this.value;
			},
			configurable: true
		},
		setupData: {
			value: function setupData(data) {
				this._value = this._serialize(data);
				this._original = this.value;

				//parent.childChanged(this);
			},
			writable: true,
			configurable: true
		},
		toJSON: {
			value: function toJSON() {
				return this.value;
			},
			writable: true,
			configurable: true
		}
	});

	return Type;
})();

module.exports = Type;