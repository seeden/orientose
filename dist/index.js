"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _orientose = require("./orientose");

var _loop = function _loop(_key2) {
  if (_key2 === "default") return "continue";
  Object.defineProperty(exports, _key2, {
    enumerable: true,
    get: function get() {
      return _orientose[_key2];
    }
  });
};

for (var _key2 in _orientose) {
  var _ret = _loop(_key2);

  if (_ret === "continue") continue;
}

require("babel/register");