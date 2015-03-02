# Orientose

Orientose is a OrientDB object modeling with support of schemas inspired by mongoose. Some features of mongoose are used in simplified way. Orientose will create database structure for you automatically from your schema. 

## Features
 * Default values
 * Virtual computed properties
 * Define schemas
 * Extended validation (sync, async)
 * Pre/post hooks for save, update, remove
 * Create db structure from your schema automatically
 * Plugins like in mongoose


## Create Connection

	var Orientose = require('orientose');
	var Schema = Orientose.Schema;

	var connection = new Orientose({
		host: 'localhost',
		port: 2424,
		username: 'root',
		password: 'yourpassword'
	}, 'mydb'); 


## Create Schema

	var Orientose = require('orientose');
	var Schema = Orientose.Schema;
	var geojson = require('orientose-geojson');

	var schema = new Schema({
		name: { type: String, required: true },
		isAdmin : { type: Boolean, default: false, readonly: true },
		points  : { type: Number, default: 30, notNull: true, min: 0, max: 99999 }
	});

	schema.virtual('niceName').get(function() {
		return 'Cool ' + this.name;
	});

	schema.plugin(geojson);


## Create Model

	var User = connection.model('User', schema);


## Create Document from Model

	User.create({
		name: 'Peter Max'
	}, function(err, user) {
		if(err) {
			return console.log(err.message);
		}

		console.log(user.name);      //Peter Max
		console.log(user.niceName);  // Cool Peter Max
	});
		
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