import Type from './type';

export default class Virtual extends Type {
	constructor (data, prop) {
		super(data, prop);
	}

	_serialize(value) {
		this.applySet(this.data, value);
	}

	_deserialize() {
		return this.applyGet(this.data);
	}

	static toString() {
		return 'Virtual';
	}	

	applyGet (scope) {
		if(!this.options.get) {
			throw new Error('Getter is not defined');
		}

		return this.options.get.call(scope, this);
	}

	applySet (scope, value) {
		if(!this.options.set) {
			throw new Error('Setter is not defined');
		}

		this.options.set.call(scope, value, this);
		return this;
	}
}