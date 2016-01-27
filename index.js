#!/usr/bin/env node
/* eslint quotes: [0], strict: [0] */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var _ = _require._;
var $s = _require.$s;
var $r = _require.$r;

var marked = require("mdast");
// var path = require('path')
var $S = require("string");

var _require2 = require("./lib/latex");

var toLatex = _require2.toLatex;

var os = require("os");

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = $o("-h", "--help", false, o);
    var latex = $o("-t", "--latex", false, o);
    var ascii = $o("-a", "--ascii", false, o);
    var file = o.FILE;
    var stdout = false;
    if (_.isUndefined(file) || _.isNull(file)) {
        stdout = true;
    }
    var pdf = !latex;
    return {
        help: help, file: file, pdf: pdf, latex: latex, stdout: stdout, ascii: ascii
    };
};

function error(s) {
    console.error(s);
    throw s;
}

function getLayoutElements(a) {
    return _.filter(_.keys(a), function (k) {
        return $S(k).isAlpha();
    });
}

function getInvisiblePoints(a) {
    return _.filter(_.keys(a), function (k) {
        return $S(k).isNumeric();
    });
}

function getRect(lin, c) {

    var lowestRow = lin.length;
    var lowestCol = _.max(_.map(lin, function (it) {
        return it.length;
    }));

    var highestRow = 0;
    var highestCol = 0;
    _.forEach(lin, function (it, r) {
        if (it.indexOf(c) !== -1) {
            lowestRow = Math.min(lowestRow, r);
            lowestCol = Math.min(lowestCol, it.indexOf(c));
            highestRow = Math.max(highestRow, r);
            highestCol = Math.max(highestCol, it.lastIndexOf(c));
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
    }).length];
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

function isInRect(layout, r, c) {
    return _.any(_.map(layout.rectangles, function (it) {
        var t = it.rectangle;
        var r1 = t.ul[0];
        var c1 = t.ul[1];
        var r2 = t.lr[0];
        var c2 = t.lr[1];
        if (r >= r1 && r <= r2 && c >= c1 && c <= c2) {
            return true;
        } else {
            return false;
        }
    }));
}

function getChar(layout, s, r, c) {
    var lin = s.split("\n");
    if (_.isUndefined(lin[r]) || lin[r].length - 1 < c) {
        if (isInRect(layout, r, c)) {
            return ".";
        } else {
            return " ";
        }
        return " ";
    } else {
        if (lin[r][c] !== " " && lin[r][c] !== ".") {
            return lin[r][c];
        } else {
            if (isInRect(layout, r, c)) {
                return ".";
            } else {
                return " ";
            }
        }
    }
}

function firstOf(array, condition) {
    return _.first(_.filter(array, condition));
}

function parseFile(opts, it) {
    var file = opts.file;
    var pdf = opts.pdf;
    var stdout = opts.stdout;
    var fileData = it;
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
    if (!opts.ascii) {
        toLatex(data).then(function (it) {
            var dir = os.tmpdir();
            var source = "" + dir + "/org2kf.tex";
            if (pdf) {
                it.to(source);
                $s.execAsync("cd " + dir + " && xelatex -interaction=batchmode " + source, {
                    silent: true
                }).then(function () {
                    if (stdout) {
                        console.log($s.cat("" + dir + "/org2kf.pdf"));
                    } else {
                        $s.execAsync("cp -f " + dir + "/org2kf.pdf " + file);
                    }
                });
            } else {
                if (stdout) {
                    console.log(it);
                } else {
                    console.log("cp " + source + " " + file);
                    $s.execAsync("cp " + source + " " + file);
                }
            }
        });
    } else {
        var y = layout.geometry[0];
        var x = layout.geometry[1];
        var r, c;
        var s = "```\n";
        for (r = 0; r < y; r++) {
            for (c = 0; c < x; c++) {
                s = s + getChar(layout, codeblock.value, r, c);
            }
            s = s + "\n";
        }
        s = s + "```";

        console.log(s);
        console.log(fileData.replace(/```[\w\n\.\s]*```/g, ""));
    }
}

function parseFileStandard(destination, content) {
    return parseFile({
        pdf: true,
        file: destination
    }, content);
}

var main = function () {
    $f.readLocal("docs/usage.md").then(function (it) {
        var opts;

        var _opts = opts = getOptions(it);

        var help = _opts.help;

        if (help) {
            console.log(it);
        } else {
            $r.stdin().then(function (it) {
                parseFile(opts, it);
            });
        }
    });
};

if (!module.parent) {
    main();
} else {
    module.exports = parseFileStandard;
}
