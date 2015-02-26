'use strict';

var EventEmitter = require('events').EventEmitter;
var Oriento = require('oriento');
var Model = require('./model');

function Connection(options, dbOptions) {
	options = options || {};
	dbOptions = dbOptions || {};

	if(typeof dbOptions === 'string') {
		var dbName = dbOptions;
		dbOptions = {
			name: dbName
		};
	}

	this._options = options;
	this._dbOptions = dbOptions;

	this._models = {};

	this._server = Oriento(options);
	this._db = this._server.use(dbOptions);
}

Connection.prototype = Object.create(EventEmitter.prototype);
Connection.prototype.constructor = Connection;

Connection.prototype.getDB = function() {
	return this._db;
};

Connection.prototype.getServer = function() {
	return this._server;
};

Connection.prototype.model = function(name, schema, options) {
	options = options || {};

	if(typeof schema === 'undefined') {
		return this._models[name];
	}

	if(this._models[name]) {
		throw new Error('Model already exists');
	}

	this._models[name] = new Model(name, schema, this, options);

	return this._models[name];
};

module.exports = Connection;