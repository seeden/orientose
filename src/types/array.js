import Type from './type';
import Schema from '../schemas/index';

export default class ArrayType extends Type {
	constructor(data, prop) {
		super(data, prop);

		if(!prop.item) {
			throw new Error('Type of the array item is not defined');
		}

		this._value = [];
	}

	_createItem(value) {
		var item = new this.prop.item.schemaType(this.data, this.prop.item);
		item.value = value;

		return item;
	}

	_empty() {
		this._value = [];
	}

	_serialize(items) {
		this._empty();

		items.forEach(item => {
			this.push(item);
		});

		return this._value;
	}

	_deserialize() {
		return this;
	}

	set(index, value) {
		return this._value[index] = this._createItem(value);
	}

	push(value) {
		return this._value.push(this._createItem(value));
	}

	pop() {
		var item = this._value.pop();
		return item ? item.value : item;
	}

	toJSON(options) {
		return this._value.map(function(item) {
			return item.toJSON(options);
		});
	}

	get isModified() {
		var jsonCurrent = JSON.stringify(this.toJSON());
		var jsonOriginal = JSON.stringify(this.original);
		return jsonCurrent === jsonOriginal;
	}	

	static toString() {
		return 'Array';
	}

	static getDbType(options) {
		return 'EMBEDDEDLIST';
	}

	static getPropertyConfig(propOptions) {
		var item = propOptions.item;

		return {
			linkedType: item.schemaType.getDbType(item.options)
		};
	}

	static get isArray() {
		return true;
	}
}