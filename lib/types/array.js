import Type from './type';
import Schema from '../schemas/index';

export default class ArrayType extends Type {
	constructor(data, options) {
		super(data, options);

		if(!options.type || !options.type.length) {
			throw new Error('Type of the array item is not defined');
		}

		this._itemSchemaType = options.type[0].schemaType;
		this._itemOptions = options.type[0].options;

		this._value = [];
	}

	_createItem(value) {
		var item = new this._itemSchemaType(this.data, this._itemOptions);
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

	static get dbType() {
		return 'EMBEDDEDLIST';
	}

	static getPropertyConfig(options) {
		var itemSchemaType = options.type[0].schemaType;

		return {
			linkedType: itemSchemaType.dbType
		};
	}
}