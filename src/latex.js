var {
    $f, _, $m, $mDoMaybe
} = require("zaccaria-cli")
var debug = require("debug")("latex")

var {
    aliases
} = require("./aliases")

function ns(x) {
    "use strict"
    if ($m(x).orSome("") === "") {
        return null;
    } else {
        return x;
    }
}

function $mns(x) {
    "use strict"
    return $m(ns(x))
}

function get(x) {
    "use strict"
    return $m(aliases[x]).orSome(x)
}

function cartesianProductOf() {
    "use strict"
    return Array.prototype.reduce.call(arguments, function(a, b) {
        var ret = [];
        a.forEach(function(a) {
            b.forEach(function(b) {
                ret.push(a.concat([b]));
            });
        });
        return ret;
    }, [
        []
    ]);
}


function toLatex(o) {
    "use strict"
    return $f.readLocal("other/tikz.tex").then(it => {
        var nodes = _.indexBy(o.labels.json, "node")

        function getSize(n) {
            var sizex = n.rectangle.lr[1] - n.rectangle.ul[1] + 1
            var sizey = n.rectangle.lr[0] - n.rectangle.ul[0] + 1
            var ox = n.rectangle.ul[1] + sizex / 2
            var oy = o.layout.geometry[0] - sizey / 2 - n.rectangle.ul[0]
            return {
                ox, oy, sizex, sizey
            }
        }

        function getOpts(n) {
            var type = $m(nodes[n.id]).orSome({
                type: "coordinate"
            }).type
            if (n.invisible || type === "coordinate") {
                n.coordinate = true
                return ["coordinate"]
            } else {
                var {
                    sizex, sizey
                } = getSize(n)

                var opts = [
                    `minimum height = ${sizey}cm`,
                    `minimum width = ${sizex}cm`,
                    type
                ]
                if (type !== "") {
                    opts = opts.concat(["draw"])
                }
                return opts;
            }
        }

        function getLabel(n) {
            return $m(nodes[n.id]).orSome({
                label: ""
            }).label
        }

        function drawNode(n) {
            var {
                ox, oy
            } = getSize(n)
            var opts = getOpts(n).join(", ")
            return `%${JSON.stringify(n.rectangle)} - ${n.id}
\\node at (${ox}cm,${oy}cm) [ ${opts} ] (${n.id}) { ${getLabel(n)} };
`
        }

        function drawLink(l) {
            var ret = $mDoMaybe(function*() {
                var s = yield $mns(l.src)
                var d = yield $mns(l.dst)
                s = s.split(",")
                d = d.split(",")
                var pairs = cartesianProductOf(s, d)

                function createPair(src, dst, first, last) {
                    return {
                        src, dst, first: first, last: last
                    }
                }

                function pairToPairs(it) {
                    if (!_.isUndefined(l.through) && l.through !== "") {
                        var t = l.through.split(",")
                        var rs = []
                        rs = rs.concat([createPair(it[0], t[0], true, false)])
                        var i;
                        for (i = 0; i < (t.length - 1); i++) {
                            rs = rs.concat([createPair(t[i], t[i + 1], false, false)])
                        }
                        rs = rs.concat([createPair(t[i], it[1], false, true)])
                        return rs
                    } else {
                        return [createPair(it[0], it[1], true, true)]
                    }
                }

                function drawNodePair(pair) {

                    var style = $m(l.style).orSome("")
                    var curve = $mns(l.curve).orSome("to")
                    var label = $m(l.label).orSome("")
                    var pattern = $m(l.pattern).orSome("")
                    var labelStyle = $m(l.labelStyle).orSome("")

                    curve = get(curve)
                    style = get(style)
                    style = style.split(",")
                    var lb = `node [ ${labelStyle} ] { ${label} } `

                    if (pattern === "last") {
                        var nodePath = _.map(pair, it => {
                            return `(${it.src})`;
                        }).join(` ${curve} `)
                        var d = _.last(pair).dst

                        return _.map(style, st => {
                            var link = `\\draw[${st}] ${nodePath} ${curve} ${lb} (${d})`
                            return `${link};`
                        }).join("\n")

                    } else {
                        var cnodePath = _.map(pair, (it) => {
                            return _.map(style, (st, stindex) => {
                                if (it.last && stindex === 0) {
                                    return `\\draw[${st}] (${it.src}) ${curve} ${lb} (${it.dst});`
                                } else {
                                    return `\\draw[${st}] (${it.src}) ${curve} (${it.dst});`
                                }
                            }).join("\n")
                        }).join("\n")
                        return cnodePath
                    }

                }

                pairs = _.map(pairs, pairToPairs)
                return _.map(pairs, drawNodePair).join("\n")
            }())

            if (!_.isString(ret)) {
                return undefined;
            } else {
                return ret;
            }
        }
        var nodesDrawn = _.map(o.layout.rectangles, drawNode).join("\n")
        var linksDrawn;
        if (!_.isUndefined(o.connections)) {
            linksDrawn = _.filter(_.map(o.connections.json, drawLink)).join("\n")
        } else {
            linksDrawn = ""
        }
        var data = nodesDrawn.concat(linksDrawn)
        return it.replace("@DISTANCE", "1cm").replace("@CODE", data)
    })
}

/*
  Small legend for node syntax:

  node at (X, Y) [ draw ( [ thick ] (rectangle | circle) ) ] { label }
*/

module.exports = {
    toLatex
}
