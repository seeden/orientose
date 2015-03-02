import Type from './type';

export default class StringType extends Type {
	_serialize(value) {
		return String(value);
	}

	_deserialize(value) {
		return value;
	}

	static get dbType() {
		return 'String';
	}
}