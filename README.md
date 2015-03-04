# Orientose

Orientose is a OrientDB object modeling with support of schemas inspired by mongoose. Some features of mongoose are used in simplified way. Orientose will create database structure for you automatically from your schema. 


## Features
 * Default values
 * Virtual computed properties
 * Define schemas
 * Extended validation (sync, async)
 * Pre/post hooks for save, update, remove
 * Create db structure and indexes from your schema automatically
 * Plugins like in mongoose

### TR|TD
Right know we have support only for schema-full. 

## Running Tests

```sh
npm test
```

## Usage

### Create Connection

```js
var Orientose = require('orientose');
var Schema = Orientose.Schema;

var connection = new Orientose({
	host: 'localhost',
	port: 2424,
	username: 'root',
	password: 'yourpassword'
}, 'mydb'); 
```


### Create Schema

```js
var Orientose = require('orientose');
var Schema = Orientose.Schema;
var geojson = require('orientose-geojson');

var schema = new Schema({
	name: { type: String, required: true, index: true, text: true },
	isAdmin : { type: Boolean, default: false, readonly: true },
	points  : { type: Number, default: 30, notNull: true, min: 0, max: 99999 },
	address : {
		city   : { type: String },
		street : { type: String } 
	},
	tags    : [String]
});

schema.virtual('niceName').get(function() {
	return 'Cool ' + this.name;
});

schema.pre('save', function(done) {
	this.address.city = 'Kosice';
	this.tags.push('admin', 'people');
	done();
});

schema.index({ tags: 1 }, { unique: true} );

schema.plugin(geojson);
```

### Create Model

```js
var User = connection.model('User', schema);
```

### Create Document from Model

```js
User.create({
	name: 'Peter Max'
}, function(err, user) {
	if(err) {
		return console.log(err.message);
	}

	user.name.should.equal('Peter Max');
	user.niceName.should.equal('Cool Peter Max');
	user.address.city.should.equal('Kosice'); //there is a pre save hook
	user.tags.length.should.equal(2); //there is a pre save hook
});
```

Alternative way with instance of document

```js
var user = new User({
	name: 'Peter Max'
});

user.points = 45;

user.save(function(err, user) {
	if(err) {
		return console.log(err.message);
	}

	user.name.should.equal('Peter Max');
	user.points.should.equal(45);
});
```

### Create Vertex model

```js
var Orientose = require('orientose');
var Schema = Orientose.Schema;

var personSchema = new Schema.V({
	name: { type: String }
});

var Person = connection.model('Person', personSchema);
```

### Create Edge model

```js
var Orientose = require('orientose');
var Schema = Orientose.Schema;

var followSchema = new Schema.E({
	when: { type: Date, default: Date.now, required: true }
}, {
	unique: true //unique index for properties in/out
});

var Follow = connection.model('Follow', followSchema);
```

### Create edge
	
```js
var Person = connection.model('Person');
var Follow = connection.model('Follow');
var Orientose = require('orientose');
var Schema = Orientose.Schema;

var followSchema = new Schema.E({
	when: { type: Date, default: Date.now, required: true }
}, {
	unique: true //unique index for properties in/out
});

var Follow = connection.model('Follow', followSchema);
Person.findOne({ name: 'Zlatko Fedor'}, function(err, person1) {
	Person.findOne({ name: 'Luca'}, function(err, person2) {
		Follow.create({
			from: person1,
			to: person2
		}, function(err, follow) {
			console.log(follow.when);
		});
	});
});
```

#### Model.findOne
Finds a single document.

```js
User.findOne({
	name: 'Zlatko Fedor'
}, function(err, user) {
	user.name.should.equal('Zlatko Fedor');
});	
```

#### Model.find
Finds multiple documents.

```js
User.find({
	name: 'Zlatko Fedor'
}, function(err, users) {
});	
```

#### Model.findByRid
Finds a single document by rid.

```js
User.findByRid(rid, function(err, user) {
	user.name = 'Luca';

	user.save(function(err, affectedRows) {
		affectedRows.should.equal(1);
	});
});
```

#### Model.removeByRid
Remove a single document by a documents rid.

```js
User.removeByRid(rid, function(err, affectedRows) {
	affectedRows.should.equal(1);
});	
```

#### Schema types
If you need to use other types from orient you can use Orientose.Type

```js
var Orientose = require('orientose');
var Schema = Orientose.Schema;

var schema = new Schema({
	count  : { type: Orientose.Type.Integer },
	count2 : { type: Orientose.Type.Long }
});	
```

		
## Credits

[Zlatko Fedor](http://github.com/seeden)

## License

The MIT License (MIT)

Copyright (c) 2015 Zlatko Fedor zlatkofedor@cherrysro.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.