import pandas as pd
import json
import random

url = 'https://raw.githubusercontent.com/vibedatascience/understat_players_aggregated/main/understat_players_aggregated_2014_2024.csv'
df = pd.read_csv(url)

# Filter: Premier League only, seasons 2015/16 to 2024/25, at least 10 games
epl = df[
    (df['league'] == 'EPL') &
    (df['year'] >= 2015) &
    (df['year'] <= 2024) &
    (df['games'] >= 10)
].copy()

# Fix HTML entities in names
epl['player_name'] = epl['player_name'].str.replace(r'&#039;', "'", regex=False)

# Map team names to shorter versions
TEAM_MAP = {
    'Manchester City': 'Man City',
    'Manchester United': 'Man Utd',
    'Newcastle United': 'Newcastle',
    'Tottenham': 'Spurs',
    'West Ham': 'West Ham',
    'Leicester': 'Leicester',
    'Brighton': 'Brighton',
    'Wolves': 'Wolves',
    'Crystal Palace': 'Crystal Palace',
    'Aston Villa': 'Aston Villa',
    'Southampton': 'Southampton',
    'Everton': 'Everton',
    'Brentford': 'Brentford',
    'Fulham': 'Fulham',
    'Bournemouth': 'Bournemouth',
    'Burnley': 'Burnley',
    'Sheffield United': 'Sheffield Utd',
    'Luton': 'Luton',
    'Nottingham Forest': "Nott'm Forest",
    'Watford': 'Watford',
    'Norwich': 'Norwich',
    'Leeds': 'Leeds',
    'West Bromwich Albion': 'West Brom',
    'Stoke': 'Stoke',
    'Swansea': 'Swansea',
    'Huddersfield': 'Huddersfield',
    'Cardiff': 'Cardiff',
}

def map_team(name):
    return TEAM_MAP.get(name, name)

epl['team_title'] = epl['team_title'].apply(map_team)

def map_season(s):
    return s.replace('/', '-')

epl['season_fmt'] = epl['season'].apply(map_season)

def map_position(row):
    pos = row['position']
    primary = row['primary_position']
    if 'GK' in pos or primary == 'GK':
        return 'GK'
    if primary == 'F':
        return 'FWD'
    if 'F' in pos and 'D' not in pos:
        return 'FWD'
    if 'F' in pos and 'D' in pos:
        return 'FWD' if primary == 'F' else 'DEF'
    if primary == 'M':
        return 'MID'
    if 'M' in pos and 'F' not in pos:
        return 'MID'
    if 'D' in pos:
        return 'DEF'
    if primary == 'D':
        return 'DEF'
    if primary == 'M':
        return 'MID'
    return 'FWD'

epl['mapped_position'] = epl.apply(map_position, axis=1)

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

# Deduplicate by id
seen_ids = set()
players_out = []

for _, row in epl.iterrows():
    pid_base = row['player_name'].lower().replace(' ', '-').replace("'", '')[:20]
    pid = f"{pid_base}-{row['team_title'].lower().replace(' ', '-')}-{row['season_fmt'].replace('/', '-')[:4]}"
    
    # dedupe
    if pid in seen_ids:
        pid = f"{pid}-{len(seen_ids)}"
    seen_ids.add(pid)
    
    pos = row['mapped_position']
    
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

    player = {
        'id': pid,
        'name': row['player_name'],
        'club': row['team_title'],
        'season': row['season_fmt'],
        'position': pos,
        'appearances': int(row['games']),
        'stats': stats,
        'eraAdjusted': stats,
    }
    players_out.append(player)

# Write JSON file
with open('src/data/players.json', 'w', encoding='utf-8') as f:
    json.dump(players_out, f, ensure_ascii=False)

# Write TS wrapper
with open('src/data/players.ts', 'w', encoding='utf-8') as f:
    f.write("import type { Player } from '../types/game';\n")
    f.write("import playersJson from './players.json';\n\n")
    f.write("export const players: Player[] = playersJson as Player[];\n")

print(f"Wrote {len(players_out)} players")
