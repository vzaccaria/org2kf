var {
    $f, _
} = require('zaccaria-cli')


function toLatex(o) {
    return $f.readLocal('other/tikz.tex').then(it => {

        function node(n) {
            var sizex = n.rectangle.lr[1] - n.rectangle.ul[1] + 1
            var sizey = n.rectangle.lr[0] - n.rectangle.ul[0] + 1

            var ox = n.rectangle.ul[1] + sizex / 2
            var oy = o.layout.geometry[0] - sizey / 2 - n.rectangle.ul[0]

            var opts = _.filter([`minimum height = ${sizey}cm`, `minimum width = ${sizex}cm`])
			if(!_.isUndefined(getType(n))) {
				opts = opts.concat(['draw', getType(n)])
			}
			opts = opts.join(", ")

            var drs = `%${JSON.stringify(n.rectangle)} - ${n.id}\n\\node at (${ox}cm,${oy}cm) [ ${opts} ] (${n.id}) { ${getLabel(n)} };\n`
            return drs;
        } 

        function getLabel(n) {
            var l = _.filter(o.labels.json, it => {
                return it.node === n.id;
            })
            if (l.length > 0) {
                return _.first(l).label
            } else {
                return n.id
            }
        }

        function getType(n) {
            var l = _.filter(o.labels.json, it => {
                return it.node === n.id && !_.isUndefined(it.type)
            })
            if (l.length > 0) {
				var t = _.first(l).type;
                if(t === "") {
					return undefined;
				} else {
					return t;
				}
			} else {
                return undefined;
            }
        }

        var nodes = _.map(o.layout.rectangles, node).join("\n")
        return it.replace('@DISTANCE', '1cm').replace('@CODE', nodes)
    })
}

/*
  Small legend for node syntax:

  node at (X, Y) [ draw ( [ thick ] (rectangle | circle) ) ] { label }
              ^ 
			  +-- decreases as moving to the bottom of the page
*/

module.exports = {
    toLatex
}
