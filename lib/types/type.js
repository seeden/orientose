export default class Type {
	constructor (data, options) {
		this._data = data;
		this._options = options || {};
		this._default = void 0;
		this._value = void 0;

		if(typeof options.default !== 'undefined') {
			this._default = this._deserialize(this._serialize(options.default));
		}
	}

	get data() {
		return this._data;
	}

	get options() {
		return this._options;
	}

	set value(value) {
		this._value = this._serialize(value);
	}

	get value() {
		var value = this._deserialize(this._value);

		if(typeof value === 'undefined' && typeof this._default !== 'undefined') {
			return this._default;
		}

		return value;
	}

	_serialize(value) {
		throw new Error('You need to override _serialize');
	}

	_deserialize(value) {
		throw new Error('You need to override _deserialize');
	}

	static get dbType() {
		throw new Error('You need to override getter dbType');
	}
}