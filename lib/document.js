'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Schema = require('./schema');

function Document(model, fields) {
	fields = fields || {};

	this._model = model;
	this._data  = new this.getSchema().getDataClass(fields); 

	this.set(fields);
}

util.inherits(Document, EventEmitter);

Document.prototype.getModel = function() {
	return this._model;
};

Document.prototype.getSchema = function() {
	return this._model.getSchema();
};

Document.prototype.set = function(fields) {
	this._data.set(fields);
	return this;
};

Document.createClass = function(model) {

	var DocumentModel = function(fields) {
		Document.call(this, model, fields); 
	};

	util.inherits(DocumentModel, Document);

	return DocumentModel;
};

module.exports = Document;