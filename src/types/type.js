export default class Type {
	constructor (data, prop) {
		if(!data || !prop) {
			throw new Error('Data or prop is undefined');
		}

		var options = prop.options || {};

		this._data     = data;
		this._prop     = prop;
		this._options  = options;

		this._default  = options.default;
		this._value    = void 0;
		this._original = void 0;
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

	get prop() {
		return this._prop;
	}


	get isMetadata() {
		return !!this.options.metadata;
	}

	set value(value) {
		this._value = this._serialize(value);
	}

	get value() {
		var value = this._deserialize(this._value);
		if(typeof value !== 'undefined') {
			return value;
		}

		var defaultValue = this._default;
		if(typeof defaultValue === 'function') {
			defaultValue = defaultValue();
		} 

		return this._deserialize(this._serialize(defaultValue));
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

	get isModified() {
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

	static getDbType(options) {
		throw new Error('You need to override getter dbType');
	}

	static get isSchemaType() {
		return true;
	}

	static getPropertyConfig(options) {
		return {};
	}
}