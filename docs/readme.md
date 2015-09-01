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

## Org Mode Boilerplate:

	#+begin_src markdown :exports none
	```
		CCC
	I 2 CCC  O
		CCC
		 1
	```


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
	#+end_src

	#+begin_src sh :exports none :var data=archmd :file arch.pdf 
	org2kf -s "$data" -p arch.pdf
	#+end_src

	#+RESULTS: graphics

## Author

* Vittorio Zaccaria

## License
Released under the BSD License.

***

