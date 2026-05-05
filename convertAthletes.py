import pandas as pd
import re

raw = """

Simone Biles
Olympian 2016, 2020, 2024

Gymnastics

Homeschooled (Spring, Texas) ‘15

Spring, TX

29

Number of olympic medals this Athlete has won
goldmedals:
7
silvermedals:
2
bronzemedals:
2
Head Shot
Jordan Chiles
Olympian 2020, 2024

Gymnastics

University of California, Los Angeles

Vancouver, WA

25

Number of olympic medals this Athlete has won
goldmedals:
1
silvermedals:
1
bronzemedals:
0
Stephen Curry smiling
Stephen Curry
Olympian 2024

Basketball

Davidson College (Davidson, N.C.)

Akron, OH

38

Number of olympic medals this Athlete has won
goldmedals:
1
silvermedals:
0
bronzemedals:
0
Headshot of Katie Ledecky
Katie Ledecky
Olympian 2012, 2016, 2020, 2024

Swimming

Stanford University

Bethesda, MD

29

Number of olympic medals this Athlete has won
goldmedals:
9
silvermedals:
4
bronze
"""

lines = [l.strip() for l in raw.split("\n") if l.strip()]

data = []
i = 0

while i < len(lines):

    # Skip noise
    if any(x in lines[i].lower() for x in ["head shot", "headshot", "smiling"]):
        i += 1
        continue

    # Identify start of athlete (name followed by Olympian)
    if i + 1 < len(lines) and "olympian" in lines[i+1].lower():

        name = lines[i]
        olympian = lines[i+1]
        sport = lines[i+2] if i+2 < len(lines) else ""
        education = lines[i+3] if i+3 < len(lines) else ""
        hometown = lines[i+4] if i+4 < len(lines) else ""
        age = lines[i+5] if i+5 < len(lines) else ""

        i += 6

        gold = silver = bronze = 0

        while i < len(lines):

            line = lines[i].lower()

            if "goldmedals" in line:
                gold = lines[i+1] if i+1 < len(lines) and lines[i+1].isdigit() else 0
                i += 2

            elif "silvermedals" in line:
                silver = lines[i+1] if i+1 < len(lines) and lines[i+1].isdigit() else 0
                i += 2

            elif "bronze" in line:
                # Handle missing bronze value (your last case)
                if i+1 < len(lines) and lines[i+1].isdigit():
                    bronze = lines[i+1]
                    i += 2
                else:
                    bronze = 0
                    i += 1
                break

            # Stop if next athlete begins
            elif i+1 < len(lines) and "olympian" in lines[i+1].lower():
                break

            else:
                i += 1

        data.append([
            name, olympian, sport, education,
            hometown, age, gold, silver, bronze
        ])

    else:
        i += 1


df = pd.DataFrame(data, columns=[
    "Name", "Olympian Years", "Sport", "Education",
    "Hometown", "Age", "Gold", "Silver", "Bronze"
])

df.to_csv("final_clean_athletes.csv", index=False)

print(df)