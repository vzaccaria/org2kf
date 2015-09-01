#!/usr/bin/env node
/* eslint quotes: [0], strict: [0] */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $fs = _require.$fs;
var _ = _require._;
var $s = _require.$s;
var $r = _require.$r;

var marked = require("mdast");
var path = require("path");
var S = require("string");

var _require2 = require("./lib/latex");

var toLatex = _require2.toLatex;

var os = require("os");

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = $o("-h", "--help", false, o);
    var file = o.FILE;
    var stdin = false;
    if (_.isUndefined(file) || _.isNull(file)) {
        stdin = true;
    }
    var pdf = $o("-p", "--pdf", false, o);
    return {
        help: help, file: file, pdf: pdf, stdin: stdin
    };
};

function error(s) {
    console.error(s);
    throw s;
}

function getLayoutElements(a) {
    return _.filter(_.keys(a), function (k) {
        return S(k).isAlpha();
    });
}

function getInvisiblePoints(a) {
    return _.filter(_.keys(a), function (k) {
        return S(k).isNumeric();
    });
}

function getRect(lin, c) {
    var lowestRow = lin.length;
    var lowestCol;
    var highestRow = 0;
    var highestCol;
    _.forEach(lin, function (it, r) {
        if (it.indexOf(c) !== -1) {
            if (r <= lowestRow) {
                lowestRow = r;
                lowestCol = it.indexOf(c);
            }
        }
        if (it.lastIndexOf(c) !== -1) {
            if (r >= highestRow) {
                highestRow = r;
                highestCol = it.lastIndexOf(c);
            }
        }
    });
    return {
        ul: [lowestRow, lowestCol],
        lr: [highestRow, highestCol]
    };
}

function tableToJson(t) {
    var headerCellArray = t.children[0].children;
    var headers = _.map(headerCellArray, function (it) {
        return it.children[0].value;
    });
    // Remove head
    t.children.splice(0, 1);
    var matrix = _.map(t.children, function (row) {
        return _.map(row.children, function (cell) {
            if (!_.isUndefined(cell.children[0])) {
                return cell.children[0].value;
            } else {
                return "";
            }
        });
    });
    var json = _.map(matrix, function (row) {
        var o = {};
        _.map(row, function (cell, index) {
            o[headers[index]] = cell;
        });
        return o;
    });
    return {
        headers: headers, json: json
    };
}

function parseLayout(s) {
    s = s.value;
    var a = s.split("");
    a = _.countBy(a, function (it) {
        return it;
    });
    if (_.isNumber(a["\t"])) {
        error("Sorry, you can't use a tab character to specify layout. Convert them to spaces");
    }
    var lin = s.split("\n");
    var le = getLayoutElements(a);
    var ip = getInvisiblePoints(a);
    var layoutRectangle = [lin.length, _.max(lin, function (it) {
        return it.length;
    })];
    return {
        geometry: layoutRectangle,
        layoutElements: le,
        invisiblePoints: ip,
        rectangles: _.map(le.concat(ip), function (it) {
            return {
                id: it,
                rectangle: getRect(lin, it),
                invisible: _.contains(ip, it)
            };
        })

    };
}

function firstOf(array, condition) {
    return _.first(_.filter(array, condition));
}

function parseFile(file, it) {
    var pdf = true;
    console.log(JSON.stringify(file, 0, 4));
    var tokens = marked.parse(it);
    var codeblock = firstOf(tokens.children, function (it) {
        return it.type === "code";
    });
    var filtered = _.map(_.filter(tokens.children, function (it) {
        return it.type === "table";
    }), tableToJson);
    var connections = firstOf(filtered, function (it) {
        return _.contains(it.headers, "src");
    });
    var labels = firstOf(filtered, function (it) {
        return _.contains(it.headers, "node");
    });
    var layout = parseLayout(codeblock);
    var data = {
        layout: layout, connections: connections, labels: labels
    };
    toLatex(data).then(function (it) {
        var dir = os.tmpdir();
        var source = "" + dir + "/org2kf.tex";
        if (pdf) {
            it.to(source);
            $s.execAsync("cd " + dir + " && xelatex " + source, {
                silent: true
            }).then(function () {
                if (_.isUndefined(file)) {
                    console.log($s.cat("" + dir + "/org2kf.pdf"));
                } else {
                    $s.cp("" + dir + "/org2kf.pdf", file);
                }
            });
        } else {
            if (_.isUndefined(file)) {
                console.log(it);
            } else {
                console.log("cp " + source + " " + file);
                $s.execAsync("cp " + source + " " + file);
            }
        }
    });
}

// var main = () => {
//     $f.readLocal('docs/usage.md').then(it => {
//         var opts;
//         var {
//             help, file, pdf, stdin
//         } = opts = getOptions(it);
//         if (help) {
//             console.log(it)
//         } else {

//             if (!stdin) {
//                 $fs.readFileAsync(file, 'utf8').then(_.curry(parseFile)(pdf))
//             } else {
//                 $r.stdin().then(_.curry(parseFile)(pdf))
//             }
//         }
//     })
// }

module.exports = parseFile;
