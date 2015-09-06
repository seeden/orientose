"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectId = (function () {
	function ObjectId(id) {
		_classCallCheck(this, ObjectId);

		this._value = id;
	}

	_createClass(ObjectId, [{
		key: "toString",
		value: function toString() {
			return this._value;
		}
	}, {
		key: "toJSON",
		value: function toJSON() {
			return this.toString();
		}
	}, {
		key: "equals",
		value: function equals(id) {
			return id && this.toString() === id.toString();
		}
	}]);

	return ObjectId;
})();

exports["default"] = ObjectId;
module.exports = exports["default"];