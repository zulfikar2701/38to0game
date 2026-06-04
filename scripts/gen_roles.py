import pandas as pd
import json
import random
import os

url = 'https://raw.githubusercontent.com/vibedatascience/understat_players_aggregated/main/understat_players_aggregated_2014_2024.csv'
df = pd.read_csv(url)

epl = df[
    (df['league'] == 'EPL') &
    (df['year'] >= 2015) &
    (df['year'] <= 2024) &
    (df['games'] >= 10)
].copy()

epl['player_name'] = epl['player_name'].str.replace(r'&#039;', "'", regex=False)
epl['team_title'] = epl['team_title'].str.split(',').str[0]

TEAM_MAP = {
    'Manchester City': 'Man City', 'Manchester United': 'Man Utd', 'Newcastle United': 'Newcastle',
    'Tottenham': 'Spurs', 'West Ham': 'West Ham', 'Leicester': 'Leicester', 'Brighton': 'Brighton',
    'Wolves': 'Wolves', 'Wolverhampton Wanderers': 'Wolves', 'Crystal Palace': 'Crystal Palace',
    'Aston Villa': 'Aston Villa', 'Southampton': 'Southampton', 'Everton': 'Everton',
    'Brentford': 'Brentford', 'Fulham': 'Fulham', 'Bournemouth': 'Bournemouth', 'Burnley': 'Burnley',
    'Sheffield United': 'Sheffield Utd', 'Luton': 'Luton', 'Luton Town': 'Luton',
    "Nottingham Forest": "Nott'm Forest", 'Watford': 'Watford', 'Norwich': 'Norwich',
    'Norwich City': 'Norwich', 'Leeds': 'Leeds', 'Leeds United': 'Leeds',
    'West Bromwich Albion': 'West Brom', 'Stoke': 'Stoke', 'Stoke City': 'Stoke',
    'Swansea': 'Swansea', 'Swansea City': 'Swansea', 'Huddersfield': 'Huddersfield',
    'Huddersfield Town': 'Huddersfield', 'Cardiff': 'Cardiff', 'Cardiff City': 'Cardiff',
    'Hull': 'Hull', 'Hull City': 'Hull', 'Middlesbrough': 'Middlesbrough', 'Sunderland': 'Sunderland',
    'Queens Park Rangers': 'QPR', 'Ipswich': 'Ipswich', 'Ipswich Town': 'Ipswich',
}

def map_team(name):
    return TEAM_MAP.get(name, name)

epl['team_title'] = epl['team_title'].apply(map_team)

def map_season(s):
    return s.replace('/', '-')

epl['season_fmt'] = epl['season'].apply(map_season)

def extract_positions(pos_string):
    positions = []
    s = str(pos_string)
    has_gk = 'GK' in s
    s = s.replace('GK', '')
    if 'D' in s: positions.append('DEF')
    if 'M' in s: positions.append('MID')
    if 'F' in s: positions.append('FWD')
    if has_gk: positions.append('GK')
    seen = set()
    unique = []
    for p in positions:
        if p not in seen:
            seen.add(p)
            unique.append(p)
    return unique

epl['all_positions'] = epl['position'].apply(extract_positions)

def map_primary_position(row):
    primary = row['primary_position']
    if primary == 'GK': return 'GK'
    if primary == 'D': return 'DEF'
    if primary == 'M': return 'MID'
    if primary == 'F': return 'FWD'
    return 'FWD'

epl['mapped_position'] = epl.apply(map_primary_position, axis=1)

# ---- LOAD STATSBOMB GROUND TRUTH FOR 2015-16 ----
STATS_BOMB_GT = {}
gt_path = os.path.join(os.path.dirname(__file__), 'statsbomb_groundtruth.json')
if os.path.exists(gt_path):
    with open(gt_path, 'r', encoding='utf-8') as f:
        STATS_BOMB_GT = json.load(f)
    print(f'Loaded {len(STATS_BOMB_GT)} StatsBomb ground truth entries')
else:
    print('No StatsBomb ground truth file found, using heuristics only')

# Role inference with StatsBomb ground truth + manual overrides
ROLE_OVERRIDES = {
    # Fullbacks
    'Trent Alexander-Arnold': 'FB', 'Andrew Robertson': 'FB', 'Kyle Walker': 'FB',
    'Kieran Trippier': 'FB', 'Luke Shaw': 'FB', 'Lucas Digne': 'FB', 'Ben Chilwell': 'FB',
    'Oleksandr Zinchenko': 'FB', 'João Cancelo': 'FB', 'Reece James': 'FB',
    'César Azpilicueta': 'FB', 'Marcos Alonso': 'FB', 'Ricardo Pereira': 'FB',
    'Pedro Porro': 'FB', 'Destiny Udogie': 'FB', 'Aaron Cresswell': 'FB',
    'Marc Cucurella': 'FB', 'Diogo Dalot': 'FB', 'Antonee Robinson': 'FB',
    'Kenny Tete': 'FB', 'Tyrick Mitchell': 'FB', 'Neco Williams': 'FB',
    'Virgil van Dijk': 'CB', 'Joël Matip': 'CB', 'Ibrahima Konaté': 'CB',
    'Harry Maguire': 'CB', 'John Stones': 'CB', 'Rúben Dias': 'CB',
    'Aymeric Laporte': 'CB', 'Thiago Silva': 'CB', 'Gabriel Magalhães': 'CB',
    'William Saliba': 'CB', 'Lewis Dunk': 'CB', 'Cristian Romero': 'CB',
    'Joachim Andersen': 'CB', 'Marc Guéhi': 'CB', 'Fabian Schär': 'CB',
    'Dan Burn': 'CB', 'Wesley Fofana': 'CB', 'Lisandro Martínez': 'CB',
    'Raphaël Varane': 'CB', 'Eric Dier': 'CB', 'Micky van de Ven': 'CB',
    'Manuel Akanji': 'CB', 'Vincent Kompany': 'CB', 'John Terry': 'CB',
    'Gary Cahill': 'CB', 'Antonio Rüdiger': 'CB', 'Fikayo Tomori': 'CB',
    'Alexis Sánchez': 'W', 'Sadio Mané': 'W', 'Mohamed Salah': 'W',
    'Mason Greenwood': 'W', 'Gabriel Martinelli': 'W', 'Bukayo Saka': 'W',
    'Phil Foden': 'W', 'Jack Grealish': 'W', 'Riyad Mahrez': 'W',
    'Philippe Coutinho': 'W', 'Roberto Firmino': 'W', 'Gabriel Jesus': 'W',
    'Kai Havertz': 'W', 'Luis Díaz': 'W', 'Diogo Jota': 'W',
    'Darwin Núñez': 'ST', 'Cody Gakpo': 'W', 'Anthony Gordon': 'W',
    'Jarrod Bowen': 'W', 'Pedro Neto': 'W', 'Eden Hazard': 'W',
    'Callum Hudson-Odoi': 'W', 'Timo Werner': 'W', 'Alexandre Lacazette': 'ST',
    'Pierre-Emerick Aubameyang': 'ST', 'Leandro Trossard': 'W', 'Eddie Nketiah': 'ST',
    'Richarlison': 'W', 'Son Heung-min': 'W', 'Dejan Kulusevski': 'W',
    'Dominic Solanke': 'ST', 'Ollie Watkins': 'ST', 'Michail Antonio': 'ST',
    'Danny Ings': 'ST', 'Che Adams': 'ST', 'Callum Wilson': 'ST',
    'Alexander Isak': 'ST', 'Taiwo Awoniyi': 'ST', 'Chris Wood': 'ST',
    'Neal Maupay': 'ST', 'Nicolas Jackson': 'ST', 'Cole Palmer': 'W',
    'Henrikh Mkhitaryan': 'W', 'Anthony Martial': 'ST', 'Romelu Lukaku': 'ST',
    'Radamel Falcao': 'ST', 'Memphis Depay': 'W', 'Daniel James': 'W',
    'Jadon Sancho': 'W', 'Alejandro Garnacho': 'W', 'Rasmus Højlund': 'ST',
    'Erling Haaland': 'ST', 'Sergio Agüero': 'ST', 'Julián Álvarez': 'ST',
    'Stevan Jovetić': 'ST', 'Edin Džeko': 'ST', 'Wilfried Bony': 'ST',
    'Kelechi Iheanacho': 'ST', 'Wilfried Zaha': 'W', 'Michael Olise': 'W',
    'Odsonne Édouard': 'ST', 'Christian Benteke': 'ST', 'Harry Kane': 'ST',
    'Jamie Vardy': 'ST', 'Olivier Giroud': 'ST', 'Diego Costa': 'ST',
    'Álvaro Morata': 'ST', 'Michy Batshuayi': 'ST', 'Tammy Abraham': 'ST',
    'Didier Drogba': 'ST', 'Fernando Torres': 'ST', 'Demba Ba': 'ST',
    'Samuel Eto\'o': 'ST', 'Gareth Bale': 'W', 'Roberto Soldado': 'ST',
    'Emmanuel Adebayor': 'ST', 'Nacer Chadli': 'W', 'Aaron Lennon': 'W',
    'Hwang Hee-chan': 'W', 'Raúl Jiménez': 'ST', 'Adama Traoré': 'W',
    'Gerard Deulofeu': 'W', 'Troy Deeney': 'ST', 'Stefano Okaka': 'ST',
    'Danny Welbeck': 'W', 'James Milner': 'CM', 'Jordan Henderson': 'CM',
    'Fabinho': 'CM', 'Thiago Alcântara': 'CM', 'Georginio Wijnaldum': 'CM',
    'Naby Keïta': 'CM', 'Alexis Mac Allister': 'CM', 'Dominik Szoboszlai': 'CM',
    'Wataru Endo': 'CM', 'Kevin De Bruyne': 'CM', 'Bernardo Silva': 'CM',
    'İlkay Gündoğan': 'CM', 'Rodri': 'CM', 'Fernandinho': 'CM',
    'Mateo Kovačić': 'CM', 'Yaya Touré': 'CM', 'David Silva': 'CM',
    'James Ward-Prowse': 'CM', 'Conor Gallagher': 'CM', 'Enzo Fernández': 'CM',
    'Moisés Caicedo': 'CM', 'Pascal Groß': 'CM', 'Billy Gilmour': 'CM',
    'James Maddison': 'CM', 'Christian Eriksen': 'CM', 'Bruno Fernandes': 'CM',
    'Martin Ødegaard': 'CM', 'Mesut Özil': 'CM', 'Paul Pogba': 'CM',
    'Juan Mata': 'CM', 'Scott McTominay': 'CM', 'Fred': 'CM',
    'Casemiro': 'CM', 'Mason Mount': 'CM', 'Eberechi Eze': 'CM',
    'Cheikhou Kouyaté': 'CM', 'Luka Milivojević': 'CM', 'James McArthur': 'CM',
    'Ruben Loftus-Cheek': 'CM', 'Rúben Neves': 'CM', 'João Moutinho': 'CM',
    'Abdoulaye Doucouré': 'CM', 'Étienne Capoue': 'CM', 'Roberto Pereyra': 'CM',
    'Moussa Sissoko': 'CM', 'Harry Winks': 'CM', 'Giovani Lo Celso': 'CM',
    'Jordan Pickford': 'GK', 'Nick Pope': 'GK', 'Emiliano Martínez': 'GK',
    'Kepa Arrizabalaga': 'GK', 'Édouard Mendy': 'GK', 'Robert Sán': 'GK',
    'Robin Olsen': 'GK', 'Fraser Forster': 'GK', 'Ben Foster': 'GK',
    'Asmir Begović': 'GK', 'Vicente Guaita': 'GK', 'Sam Johnstone': 'GK',
    'Dean Henderson': 'GK', 'Martin Dúbravka': 'GK', 'David Raya': 'GK',
    'Mark Flekken': 'GK', 'Willy Caballero': 'GK', 'Heurelho Gomes': 'GK',
    'Costel Pantilimon': 'GK', 'Daniel Bachmann': 'GK', 'Maduka Okoye': 'GK',
    'Jack Butland': 'GK', 'Steve Mandanda': 'GK', 'Julian Speroni': 'GK',
    'Wayne Hennessey': 'GK', 'Remi Matthews': 'GK', 'Karl Darlow': 'GK',
    'Loris Karius': 'GK', 'Freddie Woodman': 'GK', 'Jake Turner': 'GK',
    'Teddy Sharman-Lowe': 'GK', 'Ben Hamer': 'GK', 'Orestis Karnezis': 'GK',
    'Lucas Bergström': 'GK', 'Marcus Bettinelli': 'GK', 'Djordje Petrovic': 'GK',
    # Specific fixes for Understat misclassifications
    'Dwight McNeil': 'W',
    'James Garner': 'CM',
}

def infer_role(row):
    name = row['player_name']
    primary = row['primary_position']
    games = max(1, int(row['games']))
    goals = int(row['goals'])
    kp = float(row.get('key_passes', 0)) if pd.notna(row.get('key_passes', 0)) else 0
    season = row['season_fmt']
    
    # 1. Manual overrides (strongest priority)
    if name in ROLE_OVERRIDES:
        return ROLE_OVERRIDES[name]
    
    # 2. StatsBomb ground truth for 2015-16 season
    if season == '2015-16' and name in STATS_BOMB_GT:
        return STATS_BOMB_GT[name]
    
    # 3. Heuristics
    if primary == 'GK':
        return 'GK'
    elif primary == 'D':
        return 'FB' if (kp / games) >= 0.5 else 'CB'
    elif primary == 'M':
        return 'W' if (goals / games) >= 0.30 else 'CM'
    elif primary == 'F':
        return 'ST' if (goals / games) >= 0.45 else 'W'
    return 'CM'

epl['role'] = epl.apply(infer_role, axis=1)

random.seed(42)

TOP_DEF_CLUB_SEASONS = {
    ('Liverpool', '2019-20'), ('Liverpool', '2018-19'), ('Liverpool', '2021-22'), ('Liverpool', '2023-24'), ('Liverpool', '2024-25'),
    ('Man City', '2017-18'), ('Man City', '2018-19'), ('Man City', '2020-21'), ('Man City', '2021-22'), ('Man City', '2022-23'), ('Man City', '2023-24'),
    ('Chelsea', '2016-17'), ('Chelsea', '2020-21'),
    ('Arsenal', '2023-24'), ('Arsenal', '2024-25'),
    ('Spurs', '2016-17'),
    ('Leicester', '2015-16'),
    ('Man Utd', '2022-23'),
}

def generate_def_stats(row):
    club_season = (row['team_title'], row['season_fmt'])
    is_top = club_season in TOP_DEF_CLUB_SEASONS
    base = 1.5 if is_top else 1.0
    return {
        'tackles': round(base + random.uniform(0.3, 1.5), 1),
        'blocks': round(random.uniform(0.2, 1.0), 1),
        'aerials': round(base * 0.8 + random.uniform(0.5, 2.5), 1),
        'interceptions': round(base * 0.6 + random.uniform(0.3, 1.2), 1),
    }

def generate_gk_stats(row):
    club_season = (row['team_title'], row['season_fmt'])
    is_top = club_season in TOP_DEF_CLUB_SEASONS
    base_saves = 90 if is_top else 70
    base_cs = 12 if is_top else 7
    return {
        'saves': int(base_saves + random.uniform(-10, 20)),
        'cleanSheets': int(base_cs + random.uniform(-3, 5)),
        'distribution': int(65 + random.uniform(0, 20)),
    }

CLUB_COLORS = {
    'Arsenal': {'primary': '#EF0107', 'accent': '#FFFFFF'},
    'Aston Villa': {'primary': '#95BFE5', 'accent': '#670E36'},
    'Bournemouth': {'primary': '#DA291C', 'accent': '#000000'},
    'Brentford': {'primary': '#E30613', 'accent': '#FFFFFF'},
    'Brighton': {'primary': '#0057B8', 'accent': '#FFCD00'},
    'Burnley': {'primary': '#6C1D45', 'accent': '#99D6EA'},
    'Chelsea': {'primary': '#034694', 'accent': '#FFFFFF'},
    'Crystal Palace': {'primary': '#1B458F', 'accent': '#C4122E'},
    'Everton': {'primary': '#003399', 'accent': '#FFFFFF'},
    'Fulham': {'primary': '#000000', 'accent': '#FFFFFF'},
    'Leeds': {'primary': '#FFFFFF', 'accent': '#1D428A'},
    'Leicester': {'primary': '#003090', 'accent': '#FDBE11'},
    'Liverpool': {'primary': '#C8102E', 'accent': '#FFFFFF'},
    'Man City': {'primary': '#6CABDD', 'accent': '#FFFFFF'},
    'Man Utd': {'primary': '#DA291C', 'accent': '#FFE500'},
    'Newcastle': {'primary': '#241F20', 'accent': '#FFFFFF'},
    "Nott'm Forest": {'primary': '#DD0000', 'accent': '#FFFFFF'},
    'QPR': {'primary': '#FFFFFF', 'accent': '#1D5BA4'},
    'Southampton': {'primary': '#D71920', 'accent': '#FFFFFF'},
    'Spurs': {'primary': '#FFFFFF', 'accent': '#132257'},
    'Stoke': {'primary': '#E03A3E', 'accent': '#FFFFFF'},
    'Sunderland': {'primary': '#EB172B', 'accent': '#FFFFFF'},
    'Swansea': {'primary': '#FFFFFF', 'accent': '#000000'},
    'West Brom': {'primary': '#091453', 'accent': '#FFFFFF'},
    'West Ham': {'primary': '#7A263A', 'accent': '#1BB1E7'},
    'Wolves': {'primary': '#FDB913', 'accent': '#231F20'},
    'Luton': {'primary': '#F36523', 'accent': '#FFFFFF'},
    'Sheffield Utd': {'primary': '#EE2737', 'accent': '#FFFFFF'},
    'Watford': {'primary': '#FBEE23', 'accent': '#000000'},
    'Norwich': {'primary': '#FFF200', 'accent': '#00A650'},
    'Huddersfield': {'primary': '#0E63AD', 'accent': '#FFFFFF'},
    'Cardiff': {'primary': '#0070B5', 'accent': '#FFFFFF'},
    'Hull': {'primary': '#F5971D', 'accent': '#000000'},
    'Middlesbrough': {'primary': '#E21A23', 'accent': '#FFFFFF'},
    'Ipswich': {'primary': '#3A64A3', 'accent': '#FFFFFF'},
}

seen_ids = set()
players_out = []

for _, row in epl.iterrows():
    pid_base = row['player_name'].lower().replace(' ', '-').replace("'", '')[:20]
    pid = f"{pid_base}-{row['team_title'].lower().replace(' ', '-')}-{row['season_fmt'].replace('/', '-')[:4]}"
    
    if pid in seen_ids:
        pid = f"{pid}-{len(seen_ids)}"
    seen_ids.add(pid)
    
    pos = row['mapped_position']
    all_pos = row['all_positions']
    role = row['role']
    
    if pos == 'FWD':
        stats = {
            'goals': int(row['goals']),
            'assists': int(row['assists']),
            'shots': int(row['shots']),
        }
    elif pos == 'MID':
        stats = {
            'goals': int(row['goals']),
            'assists': int(row['assists']),
            'passes': int(random.uniform(30, 65)),
            'keyPasses': round(float(row['key_passes']) / max(1, row['games']), 1),
            'dribbles': round(random.uniform(0.3, 2.5), 1),
        }
    elif pos == 'DEF':
        stats = generate_def_stats(row)
    elif pos == 'GK':
        stats = generate_gk_stats(row)
    else:
        stats = {'goals': int(row['goals']), 'assists': int(row['assists']), 'shots': int(row['shots'])}

    club_colors = CLUB_COLORS.get(row['team_title'], {'primary': '#FFFFFF', 'accent': '#000000'})

    player = {
        'id': pid,
        'name': row['player_name'],
        'club': row['team_title'],
        'season': row['season_fmt'],
        'position': pos,
        'positions': all_pos,
        'role': role,
        'appearances': int(row['games']),
        'stats': stats,
        'eraAdjusted': stats,
        'clubColors': club_colors,
    }
    players_out.append(player)

with open('src/data/players.json', 'w', encoding='utf-8') as f:
    json.dump(players_out, f, ensure_ascii=False)

with open('src/data/players.ts', 'w', encoding='utf-8') as f:
    f.write("import type { Player } from '../types/game';\n")
    f.write("import playersJson from './players.json';\n\n")
    f.write("export const players: Player[] = playersJson as Player[];\n")

with open('src/data/clubColors.ts', 'w', encoding='utf-8') as f:
    f.write("export const clubColors: Record<string, { primary: string; accent: string }> = ")
    f.write(json.dumps(CLUB_COLORS, ensure_ascii=False))
    f.write(";\n")

print(f'Wrote {len(players_out)} players')

# Verify specific players
for p in players_out:
    if 'mcneil' in p['name'].lower() or 'garner' in p['name'].lower():
        print(f'{p["name"]} | {p["club"]} {p["season"]} | role={p["role"]}')

from collections import Counter
roles = Counter(p['role'] for p in players_out)
print('Role distribution:', dict(roles))
