import should from "should";
import Orientose, {Schema} from '../src/orientose';
import {waterfall} from "async";
import Promise from "bluebird";

var connection = null;

describe('Relationship', function() {
	var Cat, Dog, Owner, OwnsA;
	var CatSchema, DogSchema, OwnerSchema, OwnsASchema;

	it('should be able to create a connection', function(done) {
		connection = new Orientose({
			host: 'localhost',
    		port: 2424,
    		username: 'root',
    		password: 'happy'
		}, 'GratefulDeadConcerts');
		done();
	});
	it('should be able to create a simple schema', function(done) {
		CatSchema = new Schema.V({
			name: {type: String}
		}, {className: "Cat"})
		OwnerSchema = new Schema.V({
			name: {type: String}
		},{className: "OwnerSchema"})
		DogSchema = new Schema.V({
			name: {type: String}
		}, {className: "Dog"})
		OwnsASchema = new Schema.E({
			name: {type: String}
		}, {className: "OwnsA"})
		done();
	});

	it('should be able to create a model', function(done) {
		Promise.all([
			connection.model('Cat', CatSchema),
			connection.model('Dog', DogSchema),
			connection.model('Owner', OwnerSchema),
			connection.model('OwnsA', OwnsASchema)
		]).spread(function(_Cat, _Dog, _Owner, _OwnsA) {
			Cat = _Cat;
			Dog = _Dog;
			Owner = _Owner;
			OwnsA = _OwnsA;
			done();
		}).catch(done);
	});

	var CatData = {name: "meow"}, DogData = {name: "bark"}, OwnerData = {name: "felix"}, WildDogData = {name: "bite"}

	it('should be able to create vertex', function() {
		var cat = new Cat(CatData);
		var dog = new Dog(DogData);
		var owner = new Owner(OwnerData);
		var wildDog = new Dog(WildDogData);
		return Promise.all([
			cat.save(),
			dog.save(),
			owner.save(),
			wildDog.save()
		]).spread(function(cat, dog, owner) {
			// wilddog has no owner =(
			return Promise.all([
				(new OwnsA({})).from(owner).to(cat).save(),
				(new OwnsA({})).from(owner).to(dog).save()
			])
		})
	});


	it('should find cat', function(done) {
		Cat.findOne({name: "meow", "in('OwnsA').name": {"contains": "felix"}})
			.exec()
		   .then(function(cat){
		   		cat.name.should.equal(CatData.name)
		   		cat.
		   		done();
		   }).catch(done);
	});
	it('should find two dogs in total', function(done){
		Dog.find()
			.exec()
			.then(function(dogs){
				dogs.length.should.equal(2);
				done();
			}).catch(done);
	});
	it('should find one dog that is owned', function(done) {
		Dog.in(OwnsA)
		   .of(Owner.findOne({name: OwnerData.name}))
		   .exec()
		   .then(function(dogs){
		   		dogs.length.should.equal(1);
		   		dog.name.should.equal(DogData.name)
		   		done();
		   }).catch(done);
	});
});
