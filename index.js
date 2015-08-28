#!/usr/bin/env node
/* eslint quotes: [0], strict: [0] */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $fs = _require.$fs;

var marked = require("mdast");

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = $o("-h", "--help", false, o);
    var file = o.FILE;
    return {
        help: help, file: file
    };
};

var main = function () {
    $f.readLocal("docs/usage.md").then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var file = _getOptions.file;

        if (help) {
            console.log(it);
        } else {
            $fs.readFileAsync(file, "utf8").then(function (it) {
                console.log(it);
                var tokens = marked.parse(it);
                console.log(tokens);
            });
        }
    });
};

main();
