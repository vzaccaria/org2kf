
all:
	xelatex tikz.tex

edit:
	open -a "Skim" tikz.pdf
	watchman tikz.tex make
k:
	make -C .. && ../index.js ../reference/arch.md > ./tikz.tex && make

play:
	watchman ../src/latex.js 'make -C .. && ../index.js ../reference/arch.md > ./tikz.tex && make'
