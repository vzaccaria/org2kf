
```
    CCC
I 2 CCC  O
    CCC 
  1         D
    c             D
a b   d     
               F

x y z       F     F
```


| node | label  | type         |
| ---  | -----  | ---          |
| I    | $i(t)$ |              |
| O    | $o(t)$ |              |
| C    | CPU    | fill=gray!10 |
| a    |        | rectangle    |
| b    |        | rectangle    |
| c    |        | rectangle    |
| d    |        | rectangle    |
| D    |        | rectangle    |
| F    |        | rectangle    |
|      |        |              |


| src  | through | dst  | style  | label       | pattern  |
| ---- | ------- | ---- | -----  | ----------- | -------- |
| I    |         | C    | -latex | \tiny pippo |          |
| C    |         | O    | -latex |             |          |
| a    | b,c     | d    | =>     | \tiny pippo |          |
| x    | y       | z    | -latex | \tiny pluto | last     |
|      |         |      |        |             |          |



