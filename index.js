#!/usr/bin/env node
/* eslint quotes: [0], strict: [0] */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var getOption = _require.getOption;
var $f = _require.$f;

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = getOption("-h", "--help", false, o);
    return {
        help: help
    };
};

var main = function () {
    $f.readLocal("docs/usage.md").then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;

        if (help) {
            console.log(it);
        }
    });
};

main();
