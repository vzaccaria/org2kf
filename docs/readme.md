# org2kf
> {{description}}

## Install

Install it with

```
npm install org2kf
```
## Usage

```
~USAGE~
```

## Standalone
The standalone program expects the figure description on stdin.

## Org Mode Boilerplate:

		#+begin_src js :exports none :results none
			require('org2kf')('./pluto.pdf', `

			\`\`\`

				CCC
			I 2 CCC  O
				CCC
				 1

			\`\`\`

			| node | label  | type      |
			| ---  | -----  | ---       |
			| I    | $i(t)$ |           |
			| O    | $o(t)$ |           |
			| C    | CPU    | rectangle |


			| src  | dst  | style  | curve | label        |
			| ---- | ---- | -----  | ----- | ----         |
			| I    | C    | -latex |       | \\tiny pippo |
			| C    | O    | -latex |       |              |
			| 1    | O    | =>     | hv    |              |
			| 1    | 2    | =>     | hv    |              |
			`)
		#+end_src

			[[./pluto.pdf]]




## Author

* Vittorio Zaccaria

## License
Released under the BSD License.

***

