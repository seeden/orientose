"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ObjectId = (function () {
	function ObjectId(id) {
		_classCallCheck(this, ObjectId);

		this._value = id;
	}

	_createClass(ObjectId, {
		toString: {
			value: function toString() {
				return this._value;
			}
		},
		toJSON: {
			value: function toJSON() {
				return this.toString();
			}
		},
		equals: {
			value: function equals(id) {
				return id && this.toString() === id.toString();
			}
		}
	});

	return ObjectId;
})();

module.exports = ObjectId;