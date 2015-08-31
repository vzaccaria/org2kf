var {
    $f, _, $m, $mDoMaybe, $mMaybe
} = require("zaccaria-cli")

var { aliases } = require('./aliases')

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
				if(type !== "") {
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
            return $mDoMaybe(function*() {
                var s = yield $mns(l.src)
                var d = yield $mns(l.dst)
                var style = $m(l.style).orSome("")
                var curve = $mns(l.curve).orSome("to")
                    /* Ortho shortcut */
				curve = get(curve)
				style = get(style)
                style = style.split(",")
                var label = $m(l.label).orSome("")
                var labelStyle = $m(l.labelStyle).orSome("")
                var lb = `node [ ${labelStyle} ] { ${label} } `
                return _.map(style, st => {
                    var link = `\\draw[${st}] (${s}) ${curve} ${lb} (${d})`
                    return `${link};`
                }).join("\n")
            }())
        }
        var nodesDrawn = _.map(o.layout.rectangles, drawNode).join("\n")
        var connections = _.map(o.connections.json, drawLink).join("\n")
        var data = nodesDrawn.concat(connections)
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
