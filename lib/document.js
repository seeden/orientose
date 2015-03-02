import { EventEmitter } from 'events';

export default class Document extends EventEmitter {
	constructor(model, fields, options) {
		fields = fields || {};

		this._model = model;
		this._data  = new model.schema.DataClass(fields); 

		this._isNew = true;

		this.set(fields);		
	}

	set (fields) {
		this._data.set(fields);
		return this;
	}

	get isNew() {
		return this._isNew;
	}

	setupData(fields) {
		this._data.setupData(fields);
		this._isNew = false;
		return this;
	}

	toJSON(options) {
		return this._data.toJSON(options);
	}

	save(callback) {
		var properties = this.toJSON({
			virtuals: false
		});

		if(this.isNew) {
			this._model.create(properties, (err, user) => {
				if(err) {
					return callback(err);
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
	}

	remove(callback) {
		if(this.isNew) {
			return callback(null, this);
		}

		this._model.removeByRid(this.rid, (err, total) => {
			if(err) {
				return callback(err);
			}

			console.log(total);

			callback(null, this);
		});
	}


	static createClass (model) {
		class DocumentModel extends Document {
			constructor(fields) {
				super(model, fields);
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

		return DocumentModel;
	}
}