import Type from './type';

export default class DateType extends Type {
	_serialize(value) {
		return new Date(value);
	}

	_deserialize(value) {
		return value;
	}

	toJSON(options) {
		return this._value.getTime();
	}

	static getDbType(options) {
		return 'DATETIME';
	}
}