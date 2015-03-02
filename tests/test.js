import should from "should";
import Orientose, {Schema} from '../lib/index';

describe('Schema', function() {
	var schema = null;

	it('should be able to create simple schema', function() {
		schema = new Schema({
			name: { type: String }
		});
	});

	it('should be able to create data class', function() {
		var data = new schema.DataClass({});
		data.name = 'Zlatko Fedor';

		data.name.should.equal('Zlatko Fedor');
	});
});	

describe('Connection', function() {
	var schema = null;
	var connection = null;
	var User = null;

	it('should be able to create a simple schema', function() {
		schema = new Schema({
			name    : { type: String, required: true },
			isAdmin : { type: Boolean, default: false, readonly: true },
			points  : { type: Number, default: 30, notNull: true, min: 0, max: 99999 },
			hooked  : { type: String },
			address : {
				city   : { type: String, default: 'Kosice' },
				street : { type: String }
			}
		});

		schema.pre('save', function(done) {
			this.hooked = 'Hooked text';
			done();
		});

		schema.virtual('niceName').get(function() {
			return 'Mr. ' + this.name;
		});

		schema.methods.getFormatedPoints = function() {
			return 'Points: ' + this.points;
		};

		schema.statics.getStaticValue = function() {
			return 'Static value';
		};
	});

	it('should be able to create a connection', function() {
		connection = new Orientose({
			host: 'localhost',
    		port: 2424,
    		username: 'root',
    		password: 'hello'
		}, 'GratefulDeadConcerts');
	});	

	it('should be able to create a model', function(done) {
		connection.model('User', schema, function(err, UserModel) {
			if(err) {
				throw err;
			}

			User = UserModel;

			User.getStaticValue().should.equal('Static value');

			done();
		});
	});

	var rid = null;

	it('should be able to create a document', function(done) {
		var user1 = new User({
			name: 'Zlatko Fedor',
			address: {
				street: 'Huskova 19'
			}
		});

		user1.name.should.equal('Zlatko Fedor');
		user1.isAdmin.should.equal(false);
		user1.points.should.equal(30);
		user1.niceName.should.equal('Mr. Zlatko Fedor');

		user1.getFormatedPoints().should.equal('Points: 30');

		user1.isNew.should.equal(true);


		user1.save(function(err, userSaved) {
			if(err) {
				throw err;
			}

			userSaved.hooked.should.equal('Hooked text');

			rid = userSaved.rid;
			done();
		});
	});	


	it('should be able to find a document', function(done) {
		User.findByRid(rid, function(err, user) {
			if(err) {
				throw err;
			}

			user.name.should.equal('Zlatko Fedor');
			user.isAdmin.should.equal(false);
			user.points.should.equal(30);
			user.niceName.should.equal('Mr. Zlatko Fedor');
			user.hooked.should.equal('Hooked text');
			user.rid.should.equal(rid);

			user.address.street.should.equal('Huskova 19');
			user.address.city.should.equal('Kosice');

			done();
		});
	});	

	it('should be able to use toJSON', function(done) {
		User.findByRid(rid, function(err, user) {
			if(err) {
				throw err;
			}

			var json = user.toJSON({
				virtuals: true
			});

			json.name.should.equal('Zlatko Fedor');
			json.isAdmin.should.equal(false);
			json.points.should.equal(30);
			json.niceName.should.equal('Mr. Zlatko Fedor');
			json.hooked.should.equal('Hooked text');


			json.address.street.should.equal('Huskova 19');
			json.address.city.should.equal('Kosice');

			done();
		});
	});	

	it('should be able to remove a document', function(done) {
		User.removeByRid(rid, function(err, total) {
			if(err) {
				throw err;
			}

			total.should.equal(1);

			done();
		});
	});	
});
