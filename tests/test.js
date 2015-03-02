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

	it('should be able to create a simple schema', function() {
		schema = new Schema({
			name    : { type: String, required: true },
			isAdmin : { type: Boolean, default: false, readonly: true },
			points  : { type: Number, default: 30, notNull: true, min: 0, max: 99999 }
		});

		schema.virtual('niceName').get(function() {
			return 'Mr. ' + this.name;
		});
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
		connection.model('User', schema, function(err, User) {
			if(err) {
				throw err;
			}

			var user1 = new User({
				name: 'Zlatko Fedor',
			});

			user1.name.should.equal('Zlatko Fedor');
			user1.isNew.should.equal(true);
			user1.isAdmin.should.equal(false);
			user1.points.should.equal(30);
			user1.niceName.should.equal('Mr. Zlatko Fedor');

			done();
		});
	});
});
