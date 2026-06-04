import json

lines = """salah-liverpool-2017|Mohamed Salah|Liverpool|2017-18|FWD|36|{"goals":32,"assists":10,"shots":144}
mane-liverpool-2017|Sadio Mane|Liverpool|2017-18|FWD|29|{"goals":10,"assists":7,"shots":68}
firmino-liverpool-2017|Roberto Firmino|Liverpool|2017-18|FWD|37|{"goals":15,"assists":7,"shots":89}
henderson-liverpool-2017|Jordan Henderson|Liverpool|2017-18|MID|27|{"goals":1,"assists":4,"passes":65,"keyPasses":1.8,"dribbles":0.5}
alexander-arnold-liverpool-2017|Trent Alexander-Arnold|Liverpool|2017-18|DEF|24|{"tackles":1.8,"blocks":0.4,"aerials":1.2,"interceptions":1.5}
van-dijk-liverpool-2017|Virgil van Dijk|Liverpool|2017-18|DEF|14|{"tackles":1.5,"blocks":0.6,"aerials":3.8,"interceptions":1.2}
salah-liverpool-2019|Mohamed Salah|Liverpool|2019-20|FWD|34|{"goals":19,"assists":10,"shots":115}
mane-liverpool-2019|Sadio Mane|Liverpool|2019-20|FWD|35|{"goals":18,"assists":7,"shots":78}
firmino-liverpool-2019|Roberto Firmino|Liverpool|2019-20|FWD|36|{"goals":8,"assists":7,"shots":62}
van-dijk-liverpool-2019|Virgil van Dijk|Liverpool|2019-20|DEF|38|{"tackles":1.2,"blocks":0.5,"aerials":4.5,"interceptions":0.9}
alexander-arnold-liverpool-2019|Trent Alexander-Arnold|Liverpool|2019-20|DEF|35|{"tackles":1.4,"blocks":0.3,"aerials":1.0,"interceptions":1.2}
alisson-liverpool-2019|Alisson Becker|Liverpool|2019-20|GK|29|{"saves":78,"cleanSheets":13,"distribution":82}
wijnaldum-liverpool-2019|Georginio Wijnaldum|Liverpool|2019-20|MID|37|{"goals":4,"assists":3,"passes":58,"keyPasses":1.2,"dribbles":1.1}
henderson-liverpool-2019|Jordan Henderson|Liverpool|2019-20|MID|30|{"goals":4,"assists":5,"passes":62,"keyPasses":1.5,"dribbles":0.8}
robertson-liverpool-2019|Andrew Robertson|Liverpool|2019-20|DEF|36|{"tackles":2.1,"blocks":0.4,"aerials":1.5,"interceptions":1.4}
de-bruyne-city-2017|Kevin De Bruyne|Man City|2017-18|MID|37|{"goals":8,"assists":16,"passes":72,"keyPasses":3.5,"dribbles":1.2}
silva-city-2017|David Silva|Man City|2017-18|MID|32|{"goals":9,"assists":11,"passes":68,"keyPasses":2.8,"dribbles":1.5}
aguero-city-2017|Sergio Aguero|Man City|2017-18|FWD|25|{"goals":21,"assists":6,"shots":98}
sterling-city-2017|Raheem Sterling|Man City|2017-18|FWD|33|{"goals":18,"assists":11,"shots":72}
ederson-city-2017|Ederson|Man City|2017-18|GK|36|{"saves":65,"cleanSheets":16,"distribution":88}
kompany-city-2017|Vincent Kompany|Man City|2017-18|DEF|17|{"tackles":1.5,"blocks":0.8,"aerials":3.2,"interceptions":0.8}
walker-city-2017|Kyle Walker|Man City|2017-18|DEF|32|{"tackles":1.8,"blocks":0.3,"aerials":1.2,"interceptions":1.1}
haaland-city-2022|Erling Haaland|Man City|2022-23|FWD|35|{"goals":36,"assists":8,"shots":142}
de-bruyne-city-2022|Kevin De Bruyne|Man City|2022-23|MID|32|{"goals":7,"assists":16,"passes":68,"keyPasses":3.2,"dribbles":0.9}
foden-city-2022|Phil Foden|Man City|2022-23|MID|32|{"goals":11,"assists":5,"passes":55,"keyPasses":1.8,"dribbles":2.1}
rodri-city-2022|Rodri|Man City|2022-23|MID|36|{"goals":3,"assists":4,"passes":78,"keyPasses":1.1,"dribbles":0.8}
stones-city-2022|John Stones|Man City|2022-23|DEF|24|{"tackles":1.2,"blocks":0.5,"aerials":2.1,"interceptions":0.8}
hazard-chelsea-2016|Eden Hazard|Chelsea|2016-17|MID|36|{"goals":16,"assists":5,"passes":58,"keyPasses":2.5,"dribbles":3.8}
costa-chelsea-2016|Diego Costa|Chelsea|2016-17|FWD|35|{"goals":20,"assists":7,"shots":102}
kante-chelsea-2016|N'Golo Kante|Chelsea|2016-17|MID|35|{"goals":2,"assists":2,"passes":52,"keyPasses":0.8,"dribbles":1.2}
azpilicueta-chelsea-2016|Cesar Azpilicueta|Chelsea|2016-17|DEF|38|{"tackles":2.2,"blocks":0.5,"aerials":2.1,"interceptions":1.8}
courtois-chelsea-2016|Thibaut Courtois|Chelsea|2016-17|GK|36|{"saves":88,"cleanSheets":16,"distribution":75}
mount-chelsea-2020|Mason Mount|Chelsea|2020-21|MID|36|{"goals":6,"assists":5,"passes":48,"keyPasses":1.8,"dribbles":1.2}
werner-chelsea-2020|Timo Werner|Chelsea|2020-21|FWD|35|{"goals":6,"assists":8,"shots":78}
rudiger-chelsea-2020|Antonio Rudiger|Chelsea|2020-21|DEF|34|{"tackles":1.1,"blocks":0.6,"aerials":2.8,"interceptions":0.9}
kante-chelsea-2020|N'Golo Kante|Chelsea|2020-21|MID|30|{"goals":0,"assists":2,"passes":48,"keyPasses":0.9,"dribbles":1.0}
vardy-leicester-2015|Jamie Vardy|Leicester|2015-16|FWD|36|{"goals":24,"assists":6,"shots":112}
mahrez-leicester-2015|Riyad Mahrez|Leicester|2015-16|MID|37|{"goals":17,"assists":11,"passes":38,"keyPasses":2.2,"dribbles":2.8}
kante-leicester-2015|N'Golo Kante|Leicester|2015-16|MID|37|{"goals":1,"assists":4,"passes":45,"keyPasses":0.6,"dribbles":1.5}
schmeichel-leicester-2015|Kasper Schmeichel|Leicester|2015-16|GK|38|{"saves":102,"cleanSheets":15,"distribution":68}
morgan-leicester-2015|Wes Morgan|Leicester|2015-16|DEF|38|{"tackles":1.8,"blocks":1.2,"aerials":3.5,"interceptions":1.5}
drinkwater-leicester-2015|Danny Drinkwater|Leicester|2015-16|MID|35|{"goals":3,"assists":7,"passes":52,"keyPasses":1.2,"dribbles":0.8}
kane-spurs-2016|Harry Kane|Spurs|2016-17|FWD|30|{"goals":29,"assists":7,"shots":110}
alli-spurs-2016|Dele Alli|Spurs|2016-17|MID|37|{"goals":18,"assists":7,"passes":42,"keyPasses":1.5,"dribbles":1.2}
eriksen-spurs-2016|Christian Eriksen|Spurs|2016-17|MID|36|{"goals":8,"assists":15,"passes":55,"keyPasses":3.2,"dribbles":0.8}
son-spurs-2016|Son Heung-min|Spurs|2016-17|FWD|34|{"goals":14,"assists":6,"shots":82}
rose-spurs-2016|Danny Rose|Spurs|2016-17|DEF|23|{"tackles":2.1,"blocks":0.4,"aerials":1.8,"interceptions":1.2}
saka-arsenal-2023|Bukayo Saka|Arsenal|2023-24|FWD|35|{"goals":16,"assists":9,"shots":88}
odegaard-arsenal-2023|Martin Odegaard|Arsenal|2023-24|MID|35|{"goals":8,"assists":10,"passes":58,"keyPasses":2.5,"dribbles":1.1}
rice-arsenal-2023|Declan Rice|Arsenal|2023-24|MID|38|{"goals":7,"assists":8,"passes":62,"keyPasses":1.2,"dribbles":1.0}
saliba-arsenal-2023|William Saliba|Arsenal|2023-24|DEF|38|{"tackles":1.2,"blocks":0.5,"aerials":2.8,"interceptions":0.8}
havertz-arsenal-2023|Kai Havertz|Arsenal|2023-24|FWD|37|{"goals":13,"assists":7,"shots":68}
pope-burnley-2017|Nick Pope|Burnley|2017-18|GK|35|{"saves":110,"cleanSheets":11,"distribution":58}
tarkowski-burnley-2017|James Tarkowski|Burnley|2017-18|DEF|31|{"tackles":1.8,"blocks":1.5,"aerials":4.2,"interceptions":1.2}
mee-burnley-2017|Ben Mee|Burnley|2017-18|DEF|36|{"tackles":1.5,"blocks":1.2,"aerials":3.8,"interceptions":1.0}
wood-burnley-2017|Chris Wood|Burnley|2017-18|FWD|24|{"goals":10,"assists":2,"shots":62}
wilson-newcastle-2022|Callum Wilson|Newcastle|2022-23|FWD|31|{"goals":18,"assists":5,"shots":78}
trippier-newcastle-2022|Kieran Trippier|Newcastle|2022-23|DEF|34|{"tackles":1.8,"blocks":0.3,"aerials":1.2,"interceptions":1.5}
guimaraes-newcastle-2022|Bruno Guimaraes|Newcastle|2022-23|MID|32|{"goals":4,"assists":5,"passes":52,"keyPasses":1.5,"dribbles":1.2}
botman-newcastle-2022|Sven Botman|Newcastle|2022-23|DEF|34|{"tackles":1.2,"blocks":0.8,"aerials":3.2,"interceptions":0.8}
rashford-united-2019|Marcus Rashford|Man Utd|2019-20|FWD|31|{"goals":17,"assists":7,"shots":88}
fernandes-united-2019|Bruno Fernandes|Man Utd|2019-20|MID|14|{"goals":8,"assists":7,"passes":52,"keyPasses":2.8,"dribbles":1.1}
pogba-united-2019|Paul Pogba|Man Utd|2019-20|MID|16|{"goals":1,"assists":4,"passes":55,"keyPasses":1.8,"dribbles":1.5}
maguire-united-2019|Harry Maguire|Man Utd|2019-20|DEF|34|{"tackles":1.2,"blocks":0.6,"aerials":3.5,"interceptions":0.9}
wan-bissaka-united-2019|Aaron Wan-Bissaka|Man Utd|2019-20|DEF|33|{"tackles":3.2,"blocks":0.3,"aerials":1.5,"interceptions":1.1}"""

out = "import type { Player } from '../types/game';\n\nexport const players: Player[] = [\n"
for line in lines.strip().splitlines():
    parts = line.split("|")
    pid, name, club, season, pos, apps, stats = parts
    stats_obj = json.loads(stats)
    out += f"  {{\n"
    out += f"    id: '{pid}',\n"
    out += f"    name: '{name}',\n"
    out += f"    club: '{club}',\n"
    out += f"    season: '{season}',\n"
    out += f"    position: '{pos}',\n"
    out += f"    appearances: {apps},\n"
    out += f"    stats: {json.dumps(stats_obj)},\n"
    out += f"    eraAdjusted: {json.dumps(stats_obj)},\n"
    out += f"  }},\n"
out += "];\n"

with open("src/data/players.ts", "w", encoding="utf-8") as f:
    f.write(out)
print("Wrote", len(lines.strip().splitlines()), "players")
