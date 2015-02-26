'use strict';

function Virtual (options) {
	this._options = options || {};

	this._get = null;
	this._set = null;
}

Virtual.prototype.get = function(fn) {
	this._get = fn;
	return this;
};

Virtual.prototype.set = function(fn) {
	this._set = fn;
	return this;
};

Virtual.prototype.applyGet = function(scope, defaultValue) {
	return this._get 
		? this._get.call(scope, defaultValue, this)
		: defaultValue;
};

Virtual.prototype.applySet = function(scope, value) {
	if(!this._set) {
		return this;
	}

	this._set.call(scope, value, this);
	return this;
};

module.exports = Virtual;