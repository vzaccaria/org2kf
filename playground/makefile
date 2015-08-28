
all:
	xelatex tikz.tex

edit:
	open -a "Skim" tikz.pdf
	watchman tikz.tex make

play:
	make -C ..
	../index.js ../reference/arch.md > ./tikz.tex && make
