export default class ObjectId {
	constructor(id) {
		this._value = id;
	}

	toString() {
		return this._value;
	}

	toJSON() {
		return this.toString();
	}

	equals(id) {
		return id && this.toString() === id.toString();
	}
}