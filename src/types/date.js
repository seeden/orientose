import Type from './type';

export default class DateType extends Type {
	_serialize(value) {
        return Math.floor(((new Date(value))-0));
	}

	_deserialize(value) {
		return value;
	}

	toJSON(options) {
		var value = this.value;
		return (value && value.getTime)
			? value.getTime()
			: (value && value.value )
				? value.value
				: value;
	}

	static toString() {
		return 'Date';
	}

	static getDbType(options) {
		return 'DATETIME';
	}
}
