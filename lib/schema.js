'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Kareem = require('kareem');
var _ = require('lodash');
var extend = require('node.extend');
var VirtualType = require('./types/virtual');
var Data = require('./data');

function Schema (obj, options) {
	this.methods   = {};
	this.statics   = {};

	this._obj      = {};
	this._options  = options || {};

	this._paths    = {};
	this._indexes  = {};
	this._virtuals = {};
	this._hooks    = new Kareem();

	this._dataClass = Data.createClass(schema);

	if (obj) {
		this.add(obj);
	}
}

util.inherits(Schema, EventEmitter);

Schema.prototype.getDataClass = function() {
	return this._dataClass;
};


Schema.prototype.add = function(obj) {
	if(!_.isObject(obj)) {
		throw new Error('Obj is not object');
	}

	this._obj = extend(this._obj, obj);
};

Schema.prototype.static = function(name, fn) {
	if(_.isObject(name)) {
		for (var index in name) {
			this.statics[index] = name[index];
		}
		return;
	}

	this.statics[name] = fn;
};

Schema.prototype.method = function(name, fn) {
	if(_.isObject(name)) {
		for (var index in name) {
			this.methods[index] = name[index];
		}
		return;
	}

	this.methods[name] = fn;
};

Schema.prototype.virtual = function(name, options) {
	if(name.indexOf('.') !== -1) {
		throw new Error('You can not set virtual method for subdocument in this way. Please use subschemas.');
	}

	this._virtuals[name] = this._virtuals[name] || new VirtualType(options);
	return this._virtuals[name];
};

Schema.prototype.pre = function(name, async, fn) {
	this._hooks.pre(name, async, fn);
	return this;
};

Schema.prototype.post = function(name, async, fn) {
	this._hooks.post(name, async, fn);
	return this;
};

Schema.prototype.traverse = function(fn) {
	var obj = this._obj;

	for(var fieldName in obj) {
		if(!obj.hasOwnProperty(fieldName)) {
			continue;
		}

		fn(fieldName, obj[fieldName]);
	}
	return this;
};

Schema.prototype.post = function(name, async, fn) {
	this._hooks.post(name, async, fn);
	return this;
};

module.exports = Schema;