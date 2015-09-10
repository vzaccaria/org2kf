
```
    CCC
I 2 CCC  O
    CCC 
  1
    c
a b   d

x y z
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
|      |        |              |


| src  | through | dst  | style  | label       | pattern  |
| ---- | ------- | ---- | -----  | ----------- | -------- |
| I    |         | C    | -latex | \tiny pippo |          |
| C    |         | O    | -latex |             |          |
| a    | b,c     | d    | =>     | \tiny pippo |          |
| x    | y       | z    | -latex | \tiny pluto | last     |
|      |         |      |        |             |          |



