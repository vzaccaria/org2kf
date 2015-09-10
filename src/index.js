/* eslint quotes: [0], strict: [0] */
var {
    $d, $o, $f, _, $s, $r
} = require('zaccaria-cli')

var marked = require('mdast')
// var path = require('path')
var $S = require('string')
var {
    toLatex
} = require('./lib/latex')
var os = require('os')

var getOptions = doc => {
    "use strict"
    var o = $d(doc)
    var help = $o('-h', '--help', false, o)
    var latex = $o('-t', '--latex', false, o)
    var file = o.FILE
	var stdout = false
	if(_.isUndefined(file) || _.isNull(file)) {
		stdout = true
	}
    var pdf = !latex
    return {
        help, file, pdf, latex, stdout
    }
}

function error(s) {
    console.error(s);
    throw s;
}

function getLayoutElements(a) {
    return _.filter(_.keys(a), (k) => {
        return $S(k).isAlpha();
    })
}

function getInvisiblePoints(a) {
    return _.filter(_.keys(a), (k) => {
        return $S(k).isNumeric();
    })
}

function getRect(lin, c) {
    var lowestRow = lin.length
    var lowestCol
    var highestRow = 0
    var highestCol
    _.forEach(lin, (it, r) => {
        if (it.indexOf(c) !== -1) {
            if (r <= lowestRow) {
                lowestRow = r
                lowestCol = it.indexOf(c)
            }
        }
        if (it.lastIndexOf(c) !== -1) {
            if (r >= highestRow) {
                highestRow = r
                highestCol = it.lastIndexOf(c)
            }
        }
    })
    return {
        ul: [lowestRow, lowestCol],
        lr: [highestRow, highestCol]
    }
}

function tableToJson(t) {
    var headerCellArray = t.children[0].children
    var headers = _.map(headerCellArray, (it) => {
            return it.children[0].value
        })
        // Remove head
    t.children.splice(0, 1)
    var matrix = _.map(t.children, (row) => {
        return _.map(row.children, (cell) => {
            if (!_.isUndefined(cell.children[0])) {
                return cell.children[0].value
            } else {
                return ""
            }
        })
    })
    var json = _.map(matrix, (row) => {
        var o = {}
        _.map(row, (cell, index) => {
            o[headers[index]] = cell
        })
        return o
    })
    return {
        headers, json
    }
}

function parseLayout(s) {
    s = s.value
    var a = s.split("")
    a = _.countBy(a, it => {
        return it;
    })
    if (_.isNumber(a['\t'])) {
        error("Sorry, you can't use a tab character to specify layout. Convert them to spaces")
    }
    var lin = s.split("\n")
    var le = getLayoutElements(a)
    var ip = getInvisiblePoints(a)
    var layoutRectangle = [lin.length, _.max(lin, it => {
        return it.length
    })]
    return {
        geometry: layoutRectangle,
        layoutElements: le,
        invisiblePoints: ip,
        rectangles: _.map(le.concat(ip), it => {
            return {
                id: it,
                rectangle: getRect(lin, it),
                invisible: _.contains(ip, it)
            }
        })

    }
}

function firstOf(array, condition) {
    return _.first(_.filter(array, condition))
}


function parseFile(opts, it) {
	var file = opts.file
	var pdf = opts.pdf
	var stdout = opts.stdout
    // console.log(JSON.stringify(file, 0, 4));
    var tokens = marked.parse(it)
    var codeblock = firstOf(tokens.children, it => {
        return it.type === 'code'
    })
    var filtered = _.map(_.filter(tokens.children, it => {
        return it.type === 'table'
    }), tableToJson)
    var connections = firstOf(filtered, (it) => {
        return _.contains(it.headers, 'src')
    })
    var labels = firstOf(filtered, (it) => {
        return _.contains(it.headers, 'node')
    })
    var layout = parseLayout(codeblock)
    var data = {
        layout, connections, labels
    }
    toLatex(data).then(it => {
        var dir = os.tmpdir()
        var source = `${dir}/org2kf.tex`
        if (pdf) {
            it.to(source)
            $s.execAsync(`cd ${dir} && xelatex -interaction=batchmode ${source}`, {
                silent: true
            }).then(() => {
                if (stdout) {
                    console.log($s.cat(`${dir}/org2kf.pdf`))
                } else {
                    $s.execAsync(`cp -f ${dir}/org2kf.pdf ${file}`)
                }
            })
        } else {
            if (stdout) {
                console.log(it)
            } else {
                console.log(`cp ${source} ${file}`)
                $s.execAsync(`cp ${source} ${file}`)
            }
        }
    })
}


function parseFileStandard(destination, content) {
    return parseFile({ pdf: true, file: destination }, content)
}

var main = () => {
    $f.readLocal('docs/usage.md').then(it => {
		var opts;
        var {
            help
        } = opts = getOptions(it);
        if (help) {
            console.log(it)
        } else {
            $r.stdin().then(it => {
				parseFile(opts, it)
            })
        }
    })
}

if (!module.parent) {
    main()
} else {
    module.exports = parseFileStandard
}
