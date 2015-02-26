'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Schema = require('./schema');
var Document = require('./document');

function Model(name, schema, connection, options) {
	if(!name) {
		throw new Error('Model name is not defined');
	}

	if(!schema instanceof Schema) {
		throw new Error('This is not a schema');
	}

	if(!connection) {
		throw new Error('Connection is undefined');
	}

	this._name = name;
	this._schema = schema;
	this._connection = connection;
	this._options = options || {};

	this._documentClass = Document.createClass(this)
}

util.inherits(Model, EventEmitter);


Model.prototype.getDocumentClass = function() {
	return this._documentClass;
};

Model.prototype.getName = function() {
	return this._name;
};

Model.prototype.getSchema = function() {
	return this._schema;
};

Model.prototype.getConnection = function() {
	return this._connection;
};

Model.prototype.getDB = function() {
	return this._connection.getDB();
};

Model.prototype._createDocument = function(fields) {
	return fields;
};

Model.prototype.create = function(fields, callback) {
	this
		.getDB()
		.into(this.getName())
		.set(fields)
		.one()
		.then(function(item) {
			callback(null, this._createDocument(item));
		}, function(err) {
			callback(err);
		});
};

Model.prototype.remove = function(where, callback) {
	this
		.getDB()
		.delete()
		.from(this.getName())
		.where(where)
		.scalar()
		.then(function(total) {
			callback(null, total);
		}, function(err) {
			callback(err);
		});
};

Model.prototype.update = function(where, fields, callback) {
	this
		.getDB()
		.update(this.getName())
		.set(fields)
		.where(where)
		.scalar()
		.then(function(total) {
			callback(null, total);
		}, function(err) {
			callback(err);
		});
};

Model.prototype.find = function(where, options, callback) {
	if(typeof options === 'function') {
		callback = options;
		options = {};
	}

	options = options || {};

	this
		.getDB()
		.select()
		.from(this.getName())
		.where(where)
		.transform(function (record) {
			return this._createDocument(record);
		})
		.all()
		.then(function(items) {
			callback(null, items);
		}, function(err) {
			callback(err);
		});
};

Model.prototype.findOne = function(where, options, callback) {
	if(typeof options === 'function') {
		callback = options;
		options = {};
	}

	options = options || {};

	this
		.getDB()
		.select()
		.from(this.getName())
		.where(where)
		.transform(function (record) {
			return this._createDocument(record);
		})
		.limit(1)
		.one()
		.then(function(item) {
			callback(null, item);
		}, function(err) {
			callback(err);
		});
};



module.exports = Model;