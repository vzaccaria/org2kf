
all:
	xelatex tikz.tex

edit:
	open -a "Skim" tikz.pdf
	watchman tikz.tex make

tex:
	make -C .. && cat ../reference/arch.md | ../index.js -t

texf:
	make -C .. && cat ../reference/arch.md | ../index.js -t > tikz.tex
	xelatex tikz.tex


pdf:
	make -C .. && cat ../reference/arch.md | ../index.js ./tikz.pdf


play:
	watchman '../src/latex.js' 'make tex'
