export default class Type {
	constructor (data, options) {
		this._data     = data;
		this._options  = options || {};

		this._default  = void 0;
		this._value    = void 0;
		this._original = void 0;

		if(typeof options.default !== 'undefined') {
			this._default = this._deserialize(this._serialize(options.default));
		}
	}

	get data() {
		return this._data;
	}

	get original() {
		return this._original;
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

	setAsOriginal() {
		this._original = this.value;
		return this;
	}

	rollback() {
		if(this.options.readonly) {
			return;
		}

		this.value = this.original;
		return this;
	}

	isModified() {
		return this.original !== this.value;
	}

	setupData(data) {
		this._value = this._serialize(data);
		this._original = this.value;

		//parent.childChanged(this);
	}

	toJSON() {
		return this.value;
	}

	static get dbType() {
		throw new Error('You need to override getter dbType');
	}

	static get isSchemaType() {
		return true;
	}
}