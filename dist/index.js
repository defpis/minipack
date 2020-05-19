
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];

        function localRequire(name) {
          return require(mapping[name]);
        }

        const module = { exports : {} };

        fn(localRequire, module, module.exports);

        return module.exports;
      }

      require(0);
    })({0:[
      function (require, module, exports) {
        "use strict";

var _module = require("./module1.js");

var _module2 = require("./module2.js");

(0, _module.a)("index.js");
(0, _module2.b)("index.js");
      },
      {"./module1.js":1,"./module2.js":2},
    ],1:[
      function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.a = a;

var _module = require("./module2.js");

function a(path) {
  console.log("function a called at " + path);
}

(0, _module.b)("module1.js");
      },
      {"./module2.js":2},
    ],2:[
      function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.b = b;
function b(path) {
  console.log("function b called at " + path);
}
      },
      {},
    ],})
  