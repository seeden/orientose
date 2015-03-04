import { EventEmitter } from 'events';

export default class Document extends EventEmitter {
	constructor(model, properties, options) {
		properties = properties || {};

		this._model = model;
		this._data  = new model.schema.DataClass(properties); 

		this._isNew = true;	
	}

	set (properties) {
		this._data.set(properties);
		return this;
	}

	get isNew() {
		return this._isNew;
	}

	setupData(properties) {
		this._data.setupData(properties);
		this._isNew = false;
		return this;
	}

	toJSON(options) {
		return this._data.toJSON(options);
	}

	save(callback) {
		var hooks = this._model.schema.hooks;
		hooks.execPre('save', this, error => {
			if(error) {
				return callback(error);
			}

			var properties = this.toJSON({
				virtuals: false,
				metadata: false
			});

			if(this.isNew) {
				this._model.create(properties, (error, user) => {
					if(error) {
						return callback(error);
					}

					this.setupData(user.toJSON({
						virtuals: false
					}));

					callback(null, this);
				});

				return;
			} 

			this._model.updateByRid(this.rid, properties, (err, total) => {
				if(err) {
					return callback(err);
				}

				this.setupData(properties);
				callback(null, this);
			});

		});
	}

	remove(callback) {
		var hooks = this._model.schema.hooks;
		hooks.execPre('remove', this, error => {
			if(error) {
				return callback(error);
			}

			if(this.isNew) {
				return callback(null, this);
			}



			this._model.removeByRid(this.rid, (err, total) => {
				if(err) {
					return callback(err);
				}


				callback(null, total);
			});
		});
	}

	static createClass (model) {
		class DocumentModel extends Document {
			constructor(properties) {
				super(model, properties);
			}
		};

		var schema = model.schema;

		//add basic data getters and setters
		schema.traverse(function(fieldName, fieldOptions) {
			Object.defineProperty(DocumentModel.prototype, fieldName, {
				enumerable: true,
				configurable: true,
				get: function() {
					return this._data[fieldName];
				},
				set: function(value) {
					this._data[fieldName] = value;
					return this;
				}
			});
		});

		//add methods
		for(var methodName in schema.methods) {
			var fn = schema.methods[methodName];
			DocumentModel.prototype[methodName] = fn;
		}

		//add statics
		for(var staticName in schema.statics) {
			var fn = schema.statics[staticName];
			DocumentModel[staticName] = fn;
		}

		DocumentModel.findByRid = function(rid, callback) {
			return model.findByRid(rid, callback);
		};

		DocumentModel.removeByRid = function(rid, callback) {
			return model.removeByRid(rid, callback);
		};

		DocumentModel.findOne = function(where, options, callback) {
			return model.findOne(where, options, callback);
		};

		DocumentModel.find = function(where, options, callback) {
			return model.find(where, options, callback);
		};

		DocumentModel.create = function(properties, callback) {
			return new DocumentModel(properties).save(callback);
		};

		return DocumentModel;
	}
}