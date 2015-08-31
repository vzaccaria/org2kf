# Makefile autogenerated by Dyi on August 31, 2015
#
# Main target: all
# Sources:  src/aliases.js  src/index.js  src/latex.js  src/test.js 

.DEFAULT_GOAL := all


.PHONY: docs
docs: k-erebjsn7 k-v8jucqmj k-eysmh5te k-ri3v7jtp k-i53j8qd8 k-sl4rdbqh


.PHONY: c-nhaqav14
c-nhaqav14: lib/aliases.js lib/index.js lib/latex.js lib/test.js


.PHONY: build
build: c-nhaqav14


.PHONY: test
test: k-a533cni5 k-opo2dqou


.PHONY: update
update: k-8q47bh32


.PHONY: major
major: k-hbp24exe k-4ohe6dx7 k-rkaqo8lr


.PHONY: minor
minor: k-222ido3q k-2ywrv9jb k-bnjfq57p


.PHONY: patch
patch: k-9o489mh4 k-i19plewa k-i2hq477f


.PHONY: prepare
prepare: lib




.PHONY: k-erebjsn7
k-erebjsn7:  
	./node_modules/.bin/git-hist history.md


.PHONY: k-v8jucqmj
k-v8jucqmj:  
	./node_modules/.bin/mustache package.json docs/readme.md | ./node_modules/.bin/stupid-replace '~USAGE~' -f docs/usage.md > readme.md


.PHONY: k-eysmh5te
k-eysmh5te:  
	cat history.md >> readme.md


.PHONY: k-ri3v7jtp
k-ri3v7jtp:  
	mkdir -p ./man/man1


.PHONY: k-i53j8qd8
k-i53j8qd8:  
	pandoc -s -f markdown -t man readme.md > ./man/man1/org2kf.1


.PHONY: k-sl4rdbqh
k-sl4rdbqh:  
	hub cm 'update docs and history.md'


.PHONY: k-8mb025dj
k-8mb025dj:  
	((echo '#!/usr/bin/env node') && cat ./lib/index.js) > index.js


.PHONY: k-l6j1uw9j
k-l6j1uw9j:  
	chmod +x ./index.js


.PHONY: all
all: 
	make build 
	make k-8mb025dj 
	make k-l6j1uw9j  


.PHONY: k-a533cni5
k-a533cni5:  
	make all


.PHONY: k-opo2dqou
k-opo2dqou:  
	./node_modules/.bin/mocha ./lib/test.js


.PHONY: k-8q47bh32
k-8q47bh32:  
	make clean && ./node_modules/.bin/babel configure.js | node


.PHONY: k-hbp24exe
k-hbp24exe:  
	make all


.PHONY: k-4ohe6dx7
k-4ohe6dx7:  
	make docs


.PHONY: k-rkaqo8lr
k-rkaqo8lr:  
	./node_modules/.bin/xyz -i major


.PHONY: k-222ido3q
k-222ido3q:  
	make all


.PHONY: k-2ywrv9jb
k-2ywrv9jb:  
	make docs


.PHONY: k-bnjfq57p
k-bnjfq57p:  
	./node_modules/.bin/xyz -i minor


.PHONY: k-9o489mh4
k-9o489mh4:  
	make all


.PHONY: k-i19plewa
k-i19plewa:  
	make docs


.PHONY: k-i2hq477f
k-i2hq477f:  
	./node_modules/.bin/xyz -i patch


.PHONY: clean
clean:  
	rm -f lib/aliases.js
	rm -f lib/index.js
	rm -f lib/latex.js
	rm -f lib/test.js




lib/aliases.js: src/aliases.js 
	./node_modules/.bin/babel --optional runtime src/aliases.js -o ./lib/aliases.js

lib/index.js: src/index.js 
	./node_modules/.bin/babel --optional runtime src/index.js -o ./lib/index.js

lib/latex.js: src/latex.js 
	./node_modules/.bin/babel --optional runtime src/latex.js -o ./lib/latex.js

lib/test.js: src/test.js 
	./node_modules/.bin/babel --optional runtime src/test.js -o ./lib/test.js

lib: 
	mkdir -p lib

