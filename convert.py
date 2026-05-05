import pandas as pd

# Raw data: year headers mixed with sport rows
# Format per year block: year, total_gold, total_silver, total_bronze, total
# Then sport rows: sport, gold, silver, bronze, total
raw = """
2024

36

42

27

105


PARA - Swimming

10

17

3

30


PARA - Track & Field

10

14

14

38


PARA - Cycling

4

1

3

8


PARA - Archery

2

0

0

2


PARA - Triathlon

3

3

2

8


PARA - Shooting

0

1

0

1


PARA - Equestrian

5

1

1

7


PARA - Canoe Sprint

0

0

1

1


PARA - Rowing

0

1

0

1


PARA - Volleyball

1

0

0

1


PARA - Basketball

1

1

0

2


PARA - Rugby

0

1

0

1


PARA - Taekwondo

0

0

1

1


PARA - Judo

0

1

1

2


PARA - Table Tennis

0

0

1

1


PARA - Badminton

0

1

0

1


2021

37

36

31

104


PARA - Cycling

3

2

3

8


PARA - Swimming

15

10

10

35


PARA - Equestrian

2

0

1

3


PARA - Track & Field

10

17

14

41


PARA - Triathlon

3

2

0

5


PARA - Archery

1

0

0

1


PARA - Canoe Sprint

0

1

0

1


PARA - Rowing

0

1

0

1


PARA - Basketball

1

0

1

2


PARA - Goalball

0

1

0

1


PARA - Rugby

0

1

0

1


PARA - Volleyball

1

0

0

1


PARA - Table Tennis

1

0

1

2


PARA - Judo

0

1

0

1


PARA - Taekwondo

0

0

1

1


2016

40

44

31

115


PARA - Track & Field

16

15

11

42


PARA - Cycling

4

9

5

18


PARA - Swimming

14

14

9

37


PARA - Triathlon

2

1

1

4


PARA - Shooting

0

0

1

1


PARA - Archery

1

0

0

1


PARA - Rowing

0

1

0

1


PARA - Sailing

0

1

0

1


PARA - Rugby

0

1

0

1


PARA - Basketball

2

0

0

2


PARA - Goalball

0

1

1

2


PARA - Volleyball

1

0

0

1


PARA - Judo

0

0

2

2


PARA - Tennis

0

1

1

2


2012

31

29

38

98


PARA - Swimming

14

13

14

41


PARA - Cycling

6

5

6

17


PARA - Track & Field

9

6

13

28


PARA - Archery

1

1

0

2


PARA - Rowing

0

0

1

1


PARA - Sailing

0

1

0

1


PARA - Rugby

0

0

1

1


PARA - Basketball

0

0

1

1


PARA - Volleyball

0

1

0

1


PARA - Judo

0

1

1

2


PARA - Tennis

1

1

1

3


2008

36

35

28

99


PARA - Swimming

17

14

13

44


PARA - Track & Field

9

14

5

28


PARA - Cycling

5

5

4

14


PARA - Sailing

1

0

1

2


PARA - Archery

0

0

2

2


PARA - Rowing

0

1

1

2


PARA - Basketball

1

0

0

1


PARA - Volleyball

0

1

0

1


PARA - Goalball

1

0

0

1


PARA - Rugby

1

0

0

1


PARA - Judo

0

0

1

1


PARA - Tennis

1

0

1

2


2004

27

22

39

88


PARA - Track & Field

7

8

11

26


PARA - Swimming

16

4

15

35


PARA - Cycling

2

4

3

9


PARA - Sailing

0

1

1

2


PARA - Archery

0

0

2

2


PARA - Equestrian

0

1

0

1


PARA - Shooting

0

1

0

1


PARA - Basketball

1

0

0

1


PARA - Volleyball

0

0

1

1


PARA - Goalball

0

1

1

2


PARA - Rugby

0

0

1

1


PARA - Table Tennis

0

0

1

1


PARA - Judo

0

1

2

3


PARA - Tennis

1

1

0

2


PARA - Fencing

0

0

1

1


2000

36

39

34

109


PARA - Swimming

15

17

7

39


PARA - Track & Field

14

15

20

49


PARA - Cycling

3

4

2

9


PARA - Powerlifting

1

1

0

2


PARA - Sailing

0

0

1

1


PARA - Basketball

0

0

1

1


PARA - Rugby

1

0

0

1


PARA - Judo

2

1

1

4


PARA - Tennis

0

1

1

2


PARA - Table Tennis

0

0

1

1


1996

46

46

66

158


PARA - Swimming

16

13

16

45


PARA - Track & Field

22

24

32

78


PARA - Cycling

2

5

6

13


PARA - Equestrian

2

0

1

3


PARA - Powerlifting

1

0

1

2


PARA - Sailing

0

0

1

1


PARA - Basketball

0

0

2

2


PARA - Goalball

0

0

1

1


PARA - Judo

0

1

3

4


PARA - Tennis

1

2

0

3


PARA - Boccia

0

0

1

1


PARA - Table Tennis

2

1

2

5


1992

75

52

48

175


PARA - Swimming

29

16

12

57


PARA - Track & Field

40

25

31

96


PARA - Cycling

1

3

0

4


PARA - Weightlifting

2

0

2

4


PARA - Powerlifting

0

1

0

1


PARA - Archery

0

1

0

1


PARA - Basketball

0

1

0

1


PARA - Judo

0

2

1

3


PARA - Tennis

2

1

0

3


PARA - Boccia

0

1

0

1


PARA - Table Tennis

1

1

2

4


1988

88

90

86

264


PARA - Swimming

31

28

21

80


PARA - Track & Field

50

56

56

162


PARA - Cycling

0

1

2

3


PARA - Weightlifting

1

2

0

3


PARA - Powerlifting

1

0

3

4


PARA - Archery

0

0

1

1


PARA - Basketball

2

0

0

2


PARA - Goalball

0

2

0

2


PARA - Judo

0

0

2

2


PARA - Table Tennis

3

1

1

5


1984

130

122

128

380


PARA - Swimming

37

25

43

105


PARA - Track & Field

73

80

73

226


PARA - Cycling

0

1

1

2


PARA - Shooting

1

0

2

3


PARA - Equestrian

5

7

1

13


PARA - Weightlifting

1

2

2

5


PARA - Powerlifting

3

1

1

5


PARA - Archery

1

0

1

2


PARA - Wrestling

7

2

0

9


PARA - Boccia

2

1

2

5


PARA - Lawn Bowls

0

0

1

1


PARA - Table Tennis

0

3

1

4


1980

69

64

51

184


PARA - Swimming

19

14

18

51


PARA - Track & Field

38

45

28

111


PARA - Weightlifting

0

2

0

2


PARA - Archery

1

1

0

2


PARA - Basketball

0

0

2

2


PARA - Wrestling

8

0

0

8


PARA - Lawn Bowls

1

1

1

3


PARA - Table Tennis

2

1

2

5


1976

63

47

47

157


PARA - Swimming

17

8

15

40


PARA - Track & Field

36

34

26

96


PARA - Weightlifting

2

0

1

3


PARA - Archery

3

0

3

6


PARA - Basketball

1

0

0

1


PARA - Snooker

0

1

0

1


PARA - Lawn Bowls

1

0

0

1


PARA - Table Tennis

2

3

2

7


PARA - Dartchery

1

1

0

2


1972

17

27

27

71


PARA - Swimming

1

3

4

8


PARA - Track & Field

14

18

18

50


PARA - Weightlifting

1

3

1

5


PARA - Archery

0

2

0

2


PARA - Basketball

1

0

0

1


PARA - Table Tennis

0

1

1

2


PARA - Lawn Bowls

0

0

2

2


PARA - Dartchery

0

0

1

1


1968

33

26

37

96


PARA - Swimming

12

10

7

29


PARA - Track & Field

16

11

16

43


PARA - Weightlifting

0

0

2

2


PARA - Archery

3

3

5

11


PARA - Lawn Bowls

0

2

3

5


PARA - Table Tennis

1

0

4

5


PARA - Dartchery

1

0

0

1


1964

47

41

32

120


PARA - Swimming

22

18

14

54


PARA - Track & Field

16

18

12

46


PARA - Weightlifting

0

0

1

1


PARA - Archery

7

0

2

9


PARA - Basketball

1

0

0

1


PARA - Snooker

0

1

0

1


PARA - Table Tennis

1

2

2

5


PARA - Fencing

0

1

1

2


PARA - Dartchery

0

1

0

1


1960

10

7

7

24


PARA - Swimming

3

6

5

14


PARA - Track & Field

3

0

1

4


PARA - Archery

2

0

1

3


PARA - Basketball

1

0

0

1


PARA - Dartchery

1

1

0

2



"""

lines = [x.strip() for x in raw.split("\n") if x.strip()]

data = []
current_year = None

i = 0
while i < len(lines):
    if lines[i].isdigit():  # year row
        current_year = lines[i]
        total = lines[i:i+5]
        data.append([current_year, "Total"] + total[1:])
        i += 5
    else:
        row = lines[i:i+5]
        data.append([current_year, row[0]] + row[1:])
        i += 5

df = pd.DataFrame(data, columns=["Year", "Category", "Gold", "Silver", "Bronze", "Total"])

df.to_csv("clean_para_structured.csv", index=False)

print(df.head(10))
