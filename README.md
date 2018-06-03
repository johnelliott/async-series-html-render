An experiment with rendering

This server incrementally renders templates in order. The header can render before database or API responses return. Each part renders as soon as it arrives or the one before it has arrives.

This technique is not very useful. After a more than few async resources something like head-of-line blocking makes it about as fast as just Promise.all.

```
9
34
4
32
47
6
42
27
29
13
43
20
31
0 <-- first
49
30
5
44
2
48
18
36
26
14
23
3
40
37
12
19
15
1 <-- second
10
28
7
24
21
22
17
39
45
46
35
11
8 < -- lol not helping
25
16
41
38
33
```
