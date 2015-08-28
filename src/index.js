/* eslint quotes: [0], strict: [0] */
var {
    $d, $o, $f, $fs, _
} = require('zaccaria-cli')

var marked = require('mdast')
var S = require('string')
var {
    toLatex
} = require('./lib/latex')


var getOptions = doc => {
    "use strict"
    var o = $d(doc)
    var help = $o('-h', '--help', false, o)
    var file = o['FILE']
    return {
        help, file
    }
}

function error(s) {
    console.error(s);
    throw s;
}

function getLayoutElements(a) {
    return _.filter(_.keys(a), (k) => {
        return S(k).isAlpha();
    })
}

function getInvisiblePoints(a) {
    return _.filter(_.keys(a), (k) => {
        return S(k).isNumeric();
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
    if (!_.isNumber(a['+'])) {
        error("Sorry, you need to specify layout margins with a '+' character")
    }
    if (_.isNumber(a['\t'])) {
        error("Sorry, you can't use a tab character to specify layout. Convert them to spaces")
    }
    var lin = s.split("\n")
    var le = getLayoutElements(a)
    var ip = getInvisiblePoints(a)
    return {
        geometry: getRect(lin, '+').lr,
        layoutElements: le,
        invisiblePoints: ip,
        rectangles: _.map(le.join(ip), it => {
            return {
                id: it,
                rectangle: getRect(lin, it)
            }
        })

    }
}

function firstOf(array, condition) {
    return _.first(_.filter(array, condition))
}

var main = () => {
    $f.readLocal('docs/usage.md').then(it => {
        var {
            help, file
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else {
            $fs.readFileAsync(file, 'utf8').then(it => {
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
                     console.log(it)
                })
            })
        }
    })
}

main()
