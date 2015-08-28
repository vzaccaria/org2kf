/* eslint quotes: [0], strict: [0] */
var {
    $d, $o, $f, $fs
} = require('zaccaria-cli')

var marked = require('mdast')


var getOptions = doc => {
    "use strict"
    var o = $d(doc)
    var help = $o('-h', '--help', false, o)
	var file = o['FILE']
    return {
        help, file
    }
}

var main = () => {
    $f.readLocal('docs/usage.md').then(it => {
        var {
            help, file
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else {
			$fs.readFileAsync(file, 'utf8').then( it => {
				console.log(it)
				var tokens = marked.parse(it)
				console.log(tokens)
			})
		}
    })
}

main()
