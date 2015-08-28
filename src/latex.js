var {
    $f, _
} = require('zaccaria-cli')


function toLatex(o) {
    return $f.readLocal('other/tikz.tex').then(it => {
		
        function node(n) {
            var sizex = n.rectangle.lr[1] - n.rectangle.ul[1] + 1
            var sizey = n.rectangle.lr[0] - n.rectangle.ul[0] + 1

            var ox = n.rectangle.ul[1] + sizex/2
            var oy = o.layout.geometry[0] - sizey/2 - n.rectangle.ul[0] 

            var opts = ["draw", "thick", "rectangle", "node distance = 0cm", `minimum height = ${sizey}cm`, `minimum width = ${sizex}cm`].join(", ")
            var drs = `%${JSON.stringify(n.rectangle)} - ${n.id}\n\\node at (${ox}cm,${oy}cm) [ ${opts} ] { ${n.id} };\n`
            return drs;
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
