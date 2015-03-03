import Type from './type';

export default class StringType extends Type {
	_serialize(value) {
		var val = String(value);

		if(val && this.options.trim) {
			val = val.trim();
		}

		return val;
	}

	_deserialize(value) {
		return value;
	}

	static get dbType() {
		return 'STRING';
	}
}