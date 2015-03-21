import { EventEmitter } from 'events';

export default class Document extends EventEmitter {
	constructor(model, properties, options) {
		properties = properties || {};

		this._model = model;
		this._data  = new model.schema.DataClass(properties); 

		this._isNew = true;	
	}

	get(path) {
		return this._data.get(path);
	}

	set(path, value) {
		this._data.set(path, value);
		return this;
	}

	get isNew() {
		return this._isNew;
	}

	isModified(path) {
		return this._data.isModified(path);
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
		var model = this._model;
		var hooks = model.schema.hooks;
		var rid = this.rid;

		if(this.isNew) {
			return callback(null, this);
		}

		hooks.execPre('remove', this, function(error) {
			if(error) {
				return callback(error);
			}

			if(model.isEdge) {
				return model.removeEdgeByRid(rid, callback);
			} 

			if(model.isVertex) {
				return model.removeVertexByRid(rid, callback);
			}		

			model.removeByRid(rid, callback);
		});
	}

	static findById(id, callback) {
		this.findByRid(id, callback);
	}

	static findByRid(rid, callback) {
		return this.model.findByRid(rid, callback);
	}

	static removeByRid(rid, callback) {
		return this.model.removeByRid(rid, callback);
	}

	static findOne(where, options, callback) {
		return this.model.findOne(where, options, callback);
	}

	static find(where, options, callback) {
		return this.model.find(where, options, callback);
	}

	static create(properties, callback) {
		return new this(properties).save(callback);
	}	

	static get model() {
		throw new Error('You need to override model getter');
	}

	static createClass (model) {
		class DocumentModel extends Document {
			constructor(properties) {
				super(model, properties);
			}

			static get model() {
				return model;
			}
		};

		var schema = model.schema;

		//add basic data getters and setters
		schema.traverse(function(fieldName, fieldOptions) {
			Object.defineProperty(DocumentModel.prototype, fieldName, {
				enumerable: true,
				configurable: true,
				get: function() {
					return this.get(fieldName);
				},
				set: function(value) {
					this.set(fieldName, value);
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

		return DocumentModel;
	}
}