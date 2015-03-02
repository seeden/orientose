export default class Virtual {
	constructor (options) {
		this._options = options || {};

		this._get = null;
		this._set = null;
	}

	get get(fn) {
		this._get = fn;
		return this;
	}

	set set(fn) {
		this._set = fn;
		return this;
	}

	applyGet (scope, defaultValue) {
		return this._get 
			? this._get.call(scope, defaultValue, this)
			: defaultValue;
	}

	applySet (scope, value) {
		if(!this._set) {
			return this;
		}

		this._set.call(scope, value, this);
		return this;
	}
}