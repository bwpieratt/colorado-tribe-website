
(() => {
  const state = {
    roster: [],
    games: [],
    news: [],
    sponsors: [],
    stats: {},
    gamechanger: {},
    playerStats: {}
  };

  const paths = {
    roster: '../data/roster.json',
    games: '../data/games.json',
    news: '../data/news.json',
    sponsors: '../data/sponsors.json',
    stats: '../data/stats.json',
    gamechanger: '../data/gamechanger.json',
    playerStats: '../data/player-stats.json'
  };

  function showToast(message) {
    const toast = document.getElementById('adminToast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function loadData() {
    for (const [key, path] of Object.entries(paths)) {
      const local = localStorage.getItem(`tribe-admin-${key}`);
      if (local) {
        state[key] = JSON.parse(local);
      } else {
        const response = await fetch(path);
        state[key] = await response.json();
      }
    }
    renderAll();
  }

  function saveLocal(key) {
    localStorage.setItem(`tribe-admin-${key}`, JSON.stringify(state[key]));
  }

  function switchPanel(name) {
    document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.admin-nav').forEach(button => button.classList.remove('active'));
    document.getElementById(`panel-${name}`).classList.add('active');
    document.querySelector(`.admin-nav[data-panel="${name}"]`)?.classList.add('active');
  }

  document.querySelectorAll('.admin-nav').forEach(button => {
    button.addEventListener('click', () => switchPanel(button.dataset.panel));
  });

  document.querySelectorAll('[data-panel-jump]').forEach(button => {
    button.addEventListener('click', () => switchPanel(button.dataset.panelJump));
  });

  function renderDashboard() {
    document.getElementById('metricPlayers').textContent = state.roster.length;
    document.getElementById('metricGames').textContent = state.games.length;
    document.getElementById('metricNews').textContent = state.news.length;
    document.getElementById('metricSponsors').textContent = state.sponsors.length;
  }

  function renderPlayerList() {
    const list = document.getElementById('playerList');
    list.innerHTML = state.roster.map((p, i) => `
      <button type="button" data-player-index="${i}">
        <strong>#${p.number || '—'} ${p.name || 'Unnamed Player'}</strong>
        <span>${p.position || ''} · ${p.college || ''}</span>
      </button>
    `).join('');
    list.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => loadPlayer(Number(button.dataset.playerIndex)));
    });
  }

  function clearPlayerForm() {
    document.getElementById('playerForm').reset();
    document.getElementById('playerIndex').value = '';
  }

  function loadPlayer(index) {
    const p = state.roster[index];
    document.getElementById('playerIndex').value = index;
    document.getElementById('playerNumber').value = p.number || '';
    document.getElementById('playerName').value = p.name || '';
    document.getElementById('playerPosition').value = p.position || '';
    document.getElementById('playerCollege').value = p.college || '';
    document.getElementById('playerHometown').value = p.hometown || '';
    document.getElementById('playerHeight').value = p.height || '';
    document.getElementById('playerWeight').value = p.weight || '';
    document.getElementById('playerBats').value = p.bats || '';
    document.getElementById('playerThrows').value = p.throws || '';
    document.getElementById('playerClass').value = p.class || '';
    document.getElementById('playerMajor').value = p.major || '';
    document.getElementById('playerPhoto').value = p.photo || '';
    document.getElementById('playerSlug').value = p.slug || '';
    document.getElementById('playerGameChangerName').value = p.gamechanger_name || p.name || '';
    document.getElementById('playerCollegeLogo').value = p.college_logo || '';
    document.getElementById('playerHighSchool').value = p.high_school || '';
    document.getElementById('playerActionPhoto').value = p.action_photo || '';
    document.getElementById('playerBio').value = p.bio || '';
    document.getElementById('playerWhyTribe').value = p.why_tribe || '';
    document.getElementById('playerCoachComments').value = p.coach_comments || '';
    document.getElementById('playerDevelopmentGoals').value = (p.development_goals || []).join('\n');
    document.getElementById('playerAwards').value = (p.awards || []).join('\n');
  }

  document.getElementById('addPlayerButton').addEventListener('click', clearPlayerForm);

  document.getElementById('playerForm').addEventListener('submit', event => {
    event.preventDefault();
    const indexValue = document.getElementById('playerIndex').value;
    const name = document.getElementById('playerName').value.trim();
    const player = {
      number: document.getElementById('playerNumber').value.trim(),
      name,
      slug: document.getElementById('playerSlug').value.trim() || slugify(name),
      position: document.getElementById('playerPosition').value.trim(),
      college: document.getElementById('playerCollege').value.trim(),
      hometown: document.getElementById('playerHometown').value.trim(),
      height: document.getElementById('playerHeight').value.trim(),
      weight: document.getElementById('playerWeight').value.trim(),
      bats: document.getElementById('playerBats').value.trim(),
      throws: document.getElementById('playerThrows').value.trim(),
      class: document.getElementById('playerClass').value.trim(),
      major: document.getElementById('playerMajor').value.trim(),
      photo: document.getElementById('playerPhoto').value.trim(),
      gamechanger_name: document.getElementById('playerGameChangerName').value.trim() || name,
      gamechanger_player_id: '',
      college_logo: document.getElementById('playerCollegeLogo').value.trim(),
      high_school: document.getElementById('playerHighSchool').value.trim(),
      action_photo: document.getElementById('playerActionPhoto').value.trim(),
      bio: document.getElementById('playerBio').value.trim(),
      why_tribe: document.getElementById('playerWhyTribe').value.trim(),
      coach_comments: document.getElementById('playerCoachComments').value.trim(),
      development_goals: document.getElementById('playerDevelopmentGoals').value.split(/\n+/).map(v => v.trim()).filter(Boolean),
      awards: document.getElementById('playerAwards').value.split(/\n+/).map(v => v.trim()).filter(Boolean),
      social: { instagram: '', x: '' },
      qa: {
        favorite_mlb_player: '',
        favorite_team: '',
        favorite_baseball_memory: '',
        walkup_song: '',
        favorite_food: '',
        hidden_talent: ''
      }
    };
    if (indexValue === '') state.roster.push(player);
    else state.roster[Number(indexValue)] = player;
    saveLocal('roster');
    renderAll();
    clearPlayerForm();
    showToast('Player saved.');
  });

  document.getElementById('deletePlayerButton').addEventListener('click', () => {
    const index = document.getElementById('playerIndex').value;
    if (index === '') return;
    state.roster.splice(Number(index), 1);
    saveLocal('roster');
    renderAll();
    clearPlayerForm();
    showToast('Player deleted.');
  });

  function renderGameList() {
    const list = document.getElementById('gameList');
    list.innerHTML = state.games.map((g, i) => `
      <button type="button" data-game-index="${i}">
        <strong>${g.display_date || g.date}</strong>
        <span>${g.opponent} · ${g.score || 'Scheduled'}</span>
      </button>
    `).join('');
    list.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => loadGame(Number(button.dataset.gameIndex)));
    });
  }

  function loadGame(index) {
    const g = state.games[index];
    document.getElementById('gameIndex').value = index;
    document.getElementById('gameOpponent').value = g.opponent || '';
    document.getElementById('gameDate').value = g.display_date || g.date || '';
    document.getElementById('gameScore').value = g.score || '';
    document.getElementById('gameResult').value = g.result || '';
    document.getElementById('gameGameChanger').value = g.gamechanger || '';
    document.getElementById('gameBoxScore').value = g.box_score || '';
    document.getElementById('gameRecap').value = g.recap || '';
    document.getElementById('gameStatus').value = g.status || g.live_status || 'Scheduled';
    document.getElementById('gameTribeScore').value = g.tribe_score || '';
    document.getElementById('gameOpponentScore').value = g.opponent_score || '';
    document.getElementById('gameTribeStarter').value = g.starting_pitcher_tribe || '';
    document.getElementById('gameOpponentStarter').value = g.starting_pitcher_opponent || '';
    document.getElementById('gameWeather').value = g.weather || '';
    document.getElementById('gameParking').value = g.parking || '';
    document.getElementById('gameAdmission').value = g.admission || '';
    document.getElementById('gameAttendance').value = g.attendance || '';
    document.getElementById('gameTimeOfGame').value = g.time_of_game || '';
    document.getElementById('gameWinningPitcher').value = g.winning_pitcher || '';
    document.getElementById('gameLosingPitcher').value = g.losing_pitcher || '';
    document.getElementById('gameSavePitcher').value = g.save_pitcher || '';
    document.getElementById('gameTribeLineup').value = (g.lineup_tribe || []).map(v => `${v.position || ''} | ${v.name || v}`).join('\n');
    document.getElementById('gameOpponentLineup').value = (g.lineup_opponent || []).map(v => `${v.position || ''} | ${v.name || v}`).join('\n');
    document.getElementById('gamePotgName').value = g.player_of_game?.name || '';
    document.getElementById('gamePotgPhoto').value = g.player_of_game?.photo || '';
    document.getElementById('gamePotgLine').value = g.player_of_game?.line || '';
    document.getElementById('gamePotgQuote').value = g.player_of_game?.quote || '';
    document.getElementById('gameKeyPerformances').value = (g.key_performances || []).map(v => `${v.name || ''} | ${v.line || v.description || ''}`).join('\n');
    document.getElementById('gameCoachQuote').value = g.coach_quote || '';
  }

  document.getElementById('gameForm').addEventListener('submit', event => {
    event.preventDefault();
    const index = Number(document.getElementById('gameIndex').value);
    if (!Number.isInteger(index)) return;
    Object.assign(state.games[index], {
      score: document.getElementById('gameScore').value.trim(),
      result: document.getElementById('gameResult').value.trim(),
      gamechanger: document.getElementById('gameGameChanger').value.trim(),
      box_score: document.getElementById('gameBoxScore').value.trim(),
      recap: document.getElementById('gameRecap').value.trim(),
      status: document.getElementById('gameStatus').value,
      live_status: document.getElementById('gameStatus').value,
      tribe_score: document.getElementById('gameTribeScore').value.trim(),
      opponent_score: document.getElementById('gameOpponentScore').value.trim(),
      starting_pitcher_tribe: document.getElementById('gameTribeStarter').value.trim(),
      starting_pitcher_opponent: document.getElementById('gameOpponentStarter').value.trim(),
      weather: document.getElementById('gameWeather').value.trim(),
      parking: document.getElementById('gameParking').value.trim(),
      admission: document.getElementById('gameAdmission').value.trim(),
      attendance: document.getElementById('gameAttendance').value.trim(),
      time_of_game: document.getElementById('gameTimeOfGame').value.trim(),
      winning_pitcher: document.getElementById('gameWinningPitcher').value.trim(),
      losing_pitcher: document.getElementById('gameLosingPitcher').value.trim(),
      save_pitcher: document.getElementById('gameSavePitcher').value.trim(),
      lineup_tribe: document.getElementById('gameTribeLineup').value.split(/\n+/).map(v => {
        const [position,name] = v.split('|').map(x => x.trim());
        return name ? { position, name } : null;
      }).filter(Boolean),
      lineup_opponent: document.getElementById('gameOpponentLineup').value.split(/\n+/).map(v => {
        const [position,name] = v.split('|').map(x => x.trim());
        return name ? { position, name } : null;
      }).filter(Boolean),
      player_of_game: {
        name: document.getElementById('gamePotgName').value.trim(),
        photo: document.getElementById('gamePotgPhoto').value.trim(),
        line: document.getElementById('gamePotgLine').value.trim(),
        quote: document.getElementById('gamePotgQuote').value.trim()
      },
      key_performances: document.getElementById('gameKeyPerformances').value.split(/\n+/).map(v => {
        const [name,line] = v.split('|').map(x => x.trim());
        return name ? { name, line } : null;
      }).filter(Boolean),
      coach_quote: document.getElementById('gameCoachQuote').value.trim()
    });
    saveLocal('games');
    renderAll();
    showToast('Game saved.');
  });

  function renderNewsList() {
    const list = document.getElementById('newsList');
    list.innerHTML = state.news.map((n, i) => `
      <button type="button" data-news-index="${i}">
        <strong>${n.title || 'Untitled Article'}</strong>
        <span>${n.category || ''} · ${n.date || ''}</span>
      </button>
    `).join('');
    list.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => loadNews(Number(button.dataset.newsIndex)));
    });
  }

  function clearNewsForm() {
    document.getElementById('newsForm').reset();
    document.getElementById('newsIndex').value = '';
  }

  function loadNews(index) {
    const n = state.news[index];
    document.getElementById('newsIndex').value = index;
    document.getElementById('newsTitle').value = n.title || '';
    document.getElementById('newsSlug').value = n.slug || '';
    document.getElementById('newsDate').value = n.date || '';
    document.getElementById('newsCategory').value = n.category || '';
    document.getElementById('newsSummary').value = n.summary || '';
    document.getElementById('newsImage').value = n.image || '';
    document.getElementById('newsFeatured').checked = Boolean(n.featured);
    document.getElementById('newsBody').value = (n.body || []).join('\n\n');
  }

  document.getElementById('addNewsButton').addEventListener('click', clearNewsForm);

  document.getElementById('newsForm').addEventListener('submit', event => {
    event.preventDefault();
    const indexValue = document.getElementById('newsIndex').value;
    const title = document.getElementById('newsTitle').value.trim();
    const item = {
      slug: document.getElementById('newsSlug').value.trim() || slugify(title),
      title,
      date: document.getElementById('newsDate').value,
      category: document.getElementById('newsCategory').value.trim(),
      summary: document.getElementById('newsSummary').value.trim(),
      image: document.getElementById('newsImage').value.trim(),
      featured: document.getElementById('newsFeatured').checked,
      body: document.getElementById('newsBody').value.split(/\n\s*\n/).map(v => v.trim()).filter(Boolean)
    };
    if (indexValue === '') state.news.push(item);
    else state.news[Number(indexValue)] = item;
    saveLocal('news');
    renderAll();
    clearNewsForm();
    showToast('Article saved.');
  });

  document.getElementById('deleteNewsButton').addEventListener('click', () => {
    const index = document.getElementById('newsIndex').value;
    if (index === '') return;
    state.news.splice(Number(index), 1);
    saveLocal('news');
    renderAll();
    clearNewsForm();
    showToast('Article deleted.');
  });

  function renderSponsorList() {
    const list = document.getElementById('sponsorList');
    list.innerHTML = state.sponsors.map((s, i) => `
      <button type="button" data-sponsor-index="${i}">
        <strong>${s.name || 'Unnamed Sponsor'}</strong>
        <span>${s.tier || ''}</span>
      </button>
    `).join('');
    list.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => loadSponsor(Number(button.dataset.sponsorIndex)));
    });
  }

  function clearSponsorForm() {
    document.getElementById('sponsorForm').reset();
    document.getElementById('sponsorIndex').value = '';
  }

  function loadSponsor(index) {
    const s = state.sponsors[index];
    document.getElementById('sponsorIndex').value = index;
    document.getElementById('sponsorName').value = s.name || '';
    document.getElementById('sponsorTier').value = s.tier || '';
    document.getElementById('sponsorLogo').value = s.logo || '';
    document.getElementById('sponsorWebsite').value = s.website || '';
    document.getElementById('sponsorDescription').value = s.description || '';
  }

  document.getElementById('addSponsorButton').addEventListener('click', clearSponsorForm);

  document.getElementById('sponsorForm').addEventListener('submit', event => {
    event.preventDefault();
    const indexValue = document.getElementById('sponsorIndex').value;
    const name = document.getElementById('sponsorName').value.trim();
    const sponsor = {
      name,
      slug: slugify(name),
      tier: document.getElementById('sponsorTier').value.trim(),
      logo: document.getElementById('sponsorLogo').value.trim(),
      website: document.getElementById('sponsorWebsite').value.trim(),
      description: document.getElementById('sponsorDescription').value.trim()
    };
    if (indexValue === '') state.sponsors.push(sponsor);
    else state.sponsors[Number(indexValue)] = sponsor;
    saveLocal('sponsors');
    renderAll();
    clearSponsorForm();
    showToast('Sponsor saved.');
  });

  document.getElementById('deleteSponsorButton').addEventListener('click', () => {
    const index = document.getElementById('sponsorIndex').value;
    if (index === '') return;
    state.sponsors.splice(Number(index), 1);
    saveLocal('sponsors');
    renderAll();
    clearSponsorForm();
    showToast('Sponsor deleted.');
  });

  function renderStatsForm() {
    const t = state.stats.team || {};
    document.getElementById('statsGames').value = t.games ?? 0;
    document.getElementById('statsWins').value = t.wins ?? 0;
    document.getElementById('statsLosses').value = t.losses ?? 0;
    document.getElementById('statsRunsScored').value = t.runs_scored ?? 0;
    document.getElementById('statsRunsAllowed').value = t.runs_allowed ?? 0;
  }

  document.getElementById('statsForm').addEventListener('submit', event => {
    event.preventDefault();
    state.stats.team = {
      games: Number(document.getElementById('statsGames').value || 0),
      wins: Number(document.getElementById('statsWins').value || 0),
      losses: Number(document.getElementById('statsLosses').value || 0),
      runs_scored: Number(document.getElementById('statsRunsScored').value || 0),
      runs_allowed: Number(document.getElementById('statsRunsAllowed').value || 0)
    };
    saveLocal('stats');
    showToast('Team stats saved.');
  });

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  document.querySelectorAll('[data-export]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.export;
      downloadJson(`${key}.json`, state[key]);
    });
  });

  document.getElementById('downloadAllButton').addEventListener('click', () => {
    for (const key of Object.keys(state)) {
      downloadJson(`${key}.json`, state[key]);
    }
    showToast('All JSON files downloaded.');
  });


  let gcImportedRows = [];

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '"' && quoted && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = !quoted;
      } else if (ch === ',' && !quoted) {
        row.push(cell);
        cell = '';
      } else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && next === '\n') i++;
        row.push(cell);
        if (row.some(v => v.trim() !== '')) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
    if (cell || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows;
  }

  function normalizeHeader(value) {
    return String(value || '').trim().toLowerCase()
      .replace(/[%./()]/g, '')
      .replace(/\s+/g, '_');
  }

  function numberValue(value, fallback = 0) {
    const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function findColumn(headers, options) {
    for (const option of options) {
      const index = headers.indexOf(option);
      if (index >= 0) return index;
    }
    return -1;
  }

  function importRowsFromCsv(text) {
    const raw = parseCsv(text);
    if (raw.length < 2) throw new Error('The CSV does not contain data rows.');
    const headers = raw[0].map(normalizeHeader);
    const indexes = {
      name: findColumn(headers, ['player', 'player_name', 'name']),
      avg: findColumn(headers, ['avg', 'batting_average']),
      obp: findColumn(headers, ['obp', 'on_base_percentage']),
      slg: findColumn(headers, ['slg', 'slugging_percentage']),
      ops: findColumn(headers, ['ops']),
      hits: findColumn(headers, ['h', 'hits']),
      hr: findColumn(headers, ['hr', 'home_runs']),
      rbi: findColumn(headers, ['rbi']),
      runs: findColumn(headers, ['r', 'runs']),
      sb: findColumn(headers, ['sb', 'stolen_bases']),
      games: findColumn(headers, ['gp', 'g', 'games', 'games_played']),
      era: findColumn(headers, ['era']),
      whip: findColumn(headers, ['whip']),
      so: findColumn(headers, ['so', 'k', 'strikeouts']),
      bb: findColumn(headers, ['bb', 'walks']),
      wins: findColumn(headers, ['w', 'wins']),
      saves: findColumn(headers, ['sv', 'saves']),
      innings: findColumn(headers, ['ip', 'innings_pitched']),
      appearances: findColumn(headers, ['app', 'appearances'])
    };
    if (indexes.name < 0) throw new Error('A player name column could not be identified.');

    return raw.slice(1).map(row => ({
      name: String(row[indexes.name] || '').trim(),
      season: {
        games: indexes.games >= 0 ? numberValue(row[indexes.games]) : 0,
        avg: indexes.avg >= 0 ? String(row[indexes.avg] || '.000') : '.000',
        obp: indexes.obp >= 0 ? String(row[indexes.obp] || '.000') : '.000',
        slg: indexes.slg >= 0 ? String(row[indexes.slg] || '.000') : '.000',
        ops: indexes.ops >= 0 ? String(row[indexes.ops] || '.000') : '.000',
        hits: indexes.hits >= 0 ? numberValue(row[indexes.hits]) : 0,
        hr: indexes.hr >= 0 ? numberValue(row[indexes.hr]) : 0,
        rbi: indexes.rbi >= 0 ? numberValue(row[indexes.rbi]) : 0,
        runs: indexes.runs >= 0 ? numberValue(row[indexes.runs]) : 0,
        sb: indexes.sb >= 0 ? numberValue(row[indexes.sb]) : 0,
        era: indexes.era >= 0 ? String(row[indexes.era] || '0.00') : '0.00',
        whip: indexes.whip >= 0 ? String(row[indexes.whip] || '0.00') : '0.00',
        strikeouts: indexes.so >= 0 ? numberValue(row[indexes.so]) : 0,
        walks: indexes.bb >= 0 ? numberValue(row[indexes.bb]) : 0,
        wins: indexes.wins >= 0 ? numberValue(row[indexes.wins]) : 0,
        saves: indexes.saves >= 0 ? numberValue(row[indexes.saves]) : 0,
        innings: indexes.innings >= 0 ? String(row[indexes.innings] || '0.0') : '0.0',
        appearances: indexes.appearances >= 0 ? numberValue(row[indexes.appearances]) : 0
      }
    })).filter(row => row.name);
  }

  function rosterMatch(importName) {
    const clean = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return state.roster.find(player =>
      clean(player.gamechanger_name || player.name) === clean(importName)
    );
  }

  function renderGcMapping() {
    const body = document.getElementById('gcMappingBody');
    if (!body) return;
    body.innerHTML = gcImportedRows.length
      ? gcImportedRows.map(row => {
          const match = rosterMatch(row.name);
          return `<tr>
            <td>${row.name}</td>
            <td>${match ? match.name : '—'}</td>
            <td><span class="gc-match ${match ? 'matched' : 'unmatched'}">${match ? 'Matched' : 'Needs Review'}</span></td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="3">Import a CSV to review player matching.</td></tr>';
  }

  function renderGcConfig() {
    const config = state.gamechanger || {};
    const teamUrl = document.getElementById('gcTeamUrl');
    if (!teamUrl) return;
    teamUrl.value = config.team_url || '';
    document.getElementById('gcTeamName').value = config.team_name || 'Colorado Tribe Baseball';
    document.getElementById('gcSeason').value = config.season || '2026';
    renderGcMapping();
  }

  document.getElementById('gcConfigForm')?.addEventListener('submit', event => {
    event.preventDefault();
    state.gamechanger = {
      ...state.gamechanger,
      team_url: document.getElementById('gcTeamUrl').value.trim(),
      team_name: document.getElementById('gcTeamName').value.trim(),
      season: document.getElementById('gcSeason').value.trim(),
      live_label: 'Follow Live on GameChanger',
      stats_last_imported: state.gamechanger.stats_last_imported || ''
    };
    saveLocal('gamechanger');
    showToast('GameChanger connection saved.');
  });

  document.getElementById('gcCsvInput')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      gcImportedRows = importRowsFromCsv(await file.text());
      const matches = gcImportedRows.filter(row => rosterMatch(row.name)).length;
      document.getElementById('gcImportSummary').textContent =
        `${gcImportedRows.length} players found · ${matches} matched · ${gcImportedRows.length - matches} need review`;
      document.getElementById('gcApplyImport').disabled = matches === 0;
      renderGcMapping();
    } catch (error) {
      gcImportedRows = [];
      document.getElementById('gcImportSummary').textContent = error.message;
      document.getElementById('gcApplyImport').disabled = true;
      renderGcMapping();
    }
  });

  document.getElementById('gcApplyImport')?.addEventListener('click', () => {
    let applied = 0;
    gcImportedRows.forEach(row => {
      const player = rosterMatch(row.name);
      if (!player) return;
      const existing = state.playerStats?.[player.slug] || {
        type: String(player.position || '').toUpperCase().includes('P') ? 'pitcher' : 'hitter',
        season: {},
        game_log: [],
        highlights: []
      };
      existing.season = { ...existing.season, ...row.season };
      if (!state.playerStats) state.playerStats = {};
      state.playerStats[player.slug] = existing;
      applied++;
    });

    state.gamechanger.stats_last_imported = new Date().toISOString();
    saveLocal('gamechanger');
    localStorage.setItem('tribe-admin-playerStats', JSON.stringify(state.playerStats || {}));
    showToast(`${applied} player records imported.`);
  });


  // ------------------------------------------------------------
  // Version 14: Roster Import Wizard
  // ------------------------------------------------------------
  const rosterImportState = {
    headers: [],
    rows: [],
    mapping: {},
    normalizedPlayers: []
  };

  const rosterFields = [
    { key: 'number', label: 'Jersey Number', aliases: ['jersey_number','jersey','number','#','no','no_'] },
    { key: 'name', label: 'Full Name', required: true, aliases: ['full_name','player_name','name','player'] },
    { key: 'position', label: 'Position', aliases: ['position','pos'] },
    { key: 'college', label: 'College', aliases: ['college','university','school'] },
    { key: 'college_logo', label: 'College Logo Filename', aliases: ['college_logo_filename','college_logo','college_logo_file'] },
    { key: 'hometown', label: 'Hometown', aliases: ['hometown','home_town','city_state'] },
    { key: 'high_school', label: 'High School', aliases: ['high_school','highschool','hs'] },
    { key: 'height', label: 'Height', aliases: ['height','ht'] },
    { key: 'weight', label: 'Weight', aliases: ['weight','wt'] },
    { key: 'bats', label: 'Bats', aliases: ['bats','bat'] },
    { key: 'throws', label: 'Throws', aliases: ['throws','throw'] },
    { key: 'class', label: 'Class', aliases: ['class','year','academic_year'] },
    { key: 'major', label: 'Major', aliases: ['major','academic_major'] },
    { key: 'photo', label: 'Headshot Filename', aliases: ['headshot_filename','headshot','photo','player_photo'] },
    { key: 'action_photo', label: 'Action Photo Filename', aliases: ['action_photo_filename','action_photo'] },
    { key: 'bio', label: 'Biography', aliases: ['biography','bio','player_bio'] },
    { key: 'why_tribe', label: 'Why I Chose the Tribe', aliases: ['why_i_chose_the_tribe','why_tribe'] },
    { key: 'coach_comments', label: 'Coach Comments', aliases: ['coach_comments','coachs_comments','coach_comment'] },
    { key: 'development_goals', label: 'Development Goals', aliases: ['development_goals','goals'] },
    { key: 'awards', label: 'Awards and Honors', aliases: ['awards_and_honors','awards','honors'] },
    { key: 'gamechanger_name', label: 'GameChanger Name', aliases: ['gamechanger_name','game_changer_name','gc_name'] },
    { key: 'instagram', label: 'Instagram', aliases: ['instagram','ig'] },
    { key: 'x', label: 'X', aliases: ['x','twitter'] },
    { key: 'favorite_mlb_player', label: 'Favorite MLB Player', aliases: ['favorite_mlb_player'] },
    { key: 'favorite_team', label: 'Favorite Team', aliases: ['favorite_team'] },
    { key: 'favorite_baseball_memory', label: 'Favorite Baseball Memory', aliases: ['favorite_baseball_memory'] },
    { key: 'walkup_song', label: 'Walk-Up Song', aliases: ['walk_up_song','walkup_song','walk_up'] },
    { key: 'favorite_food', label: 'Favorite Food', aliases: ['favorite_food'] },
    { key: 'hidden_talent', label: 'Hidden Talent', aliases: ['hidden_talent'] }
  ];

  function normalizeRosterHeader(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9#]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  function rosterSlug(value) {
    return String(value || '')
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function splitRosterItems(value) {
    return String(value || '')
      .split(/[;\n]+/)
      .map(v => v.trim())
      .filter(Boolean);
  }

  function assetPath(value, folder) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (text.includes('/')) return text;
    return `${folder}/${text}`;
  }

  function parseSimpleCsv(text) {
    const output = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '"' && quoted && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = !quoted;
      } else if (ch === ',' && !quoted) {
        row.push(cell);
        cell = '';
      } else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && next === '\n') i++;
        row.push(cell);
        if (row.some(v => String(v).trim())) output.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
    if (cell || row.length) {
      row.push(cell);
      if (row.some(v => String(v).trim())) output.push(row);
    }
    return output;
  }

  async function readRosterFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'csv') {
      return parseSimpleCsv(await file.text());
    }
    if (!window.XLSX) {
      throw new Error('Excel reader could not load. Save the Players sheet as CSV and try again.');
    }
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames.includes('Players') ? 'Players' : workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: '',
      raw: false
    }).filter(row => row.some(value => String(value).trim()));
  }

  function autoMapRosterColumns() {
    const normalizedHeaders = rosterImportState.headers.map(normalizeRosterHeader);
    rosterImportState.mapping = {};
    rosterFields.forEach(field => {
      const aliases = [normalizeRosterHeader(field.label), ...field.aliases.map(normalizeRosterHeader)];
      const index = normalizedHeaders.findIndex(header => aliases.includes(header));
      rosterImportState.mapping[field.key] = index >= 0 ? index : '';
    });
  }

  function renderRosterMapping() {
    const grid = document.getElementById('rosterMappingGrid');
    if (!grid) return;
    const options = rosterImportState.headers.map((header, index) =>
      `<option value="${index}">${header || `Column ${index + 1}`}</option>`
    ).join('');

    grid.innerHTML = rosterFields.map(field => `
      <label>
        ${field.label}${field.required ? ' *' : ''}
        <select data-roster-field="${field.key}">
          <option value="">Not included</option>
          ${options}
        </select>
      </label>
    `).join('');

    grid.querySelectorAll('select').forEach(select => {
      const current = rosterImportState.mapping[select.dataset.rosterField];
      select.value = current === '' ? '' : String(current);
      select.addEventListener('change', () => {
        rosterImportState.mapping[select.dataset.rosterField] =
          select.value === '' ? '' : Number(select.value);
      });
    });
  }

  function rowValue(row, key) {
    const index = rosterImportState.mapping[key];
    return index === '' || index === undefined ? '' : String(row[index] ?? '').trim();
  }

  function buildImportedPlayer(row, rowNumber) {
    const name = rowValue(row, 'name');
    const errors = [];
    const warnings = [];
    if (!name) errors.push('Missing full name');

    const number = rowValue(row, 'number');
    const position = rowValue(row, 'position');
    const college = rowValue(row, 'college');
    if (!number) warnings.push('No jersey number');
    if (!position) warnings.push('No position');
    if (!college) warnings.push('No college');

    const player = {
      number,
      name,
      slug: rosterSlug(name),
      position,
      college,
      college_logo: assetPath(rowValue(row, 'college_logo'), 'images/colleges'),
      hometown: rowValue(row, 'hometown'),
      high_school: rowValue(row, 'high_school'),
      height: rowValue(row, 'height'),
      weight: rowValue(row, 'weight'),
      bats: rowValue(row, 'bats'),
      throws: rowValue(row, 'throws'),
      class: rowValue(row, 'class'),
      major: rowValue(row, 'major'),
      photo: assetPath(rowValue(row, 'photo'), 'images/players'),
      action_photo: assetPath(rowValue(row, 'action_photo'), 'images/players'),
      bio: rowValue(row, 'bio'),
      why_tribe: rowValue(row, 'why_tribe'),
      coach_comments: rowValue(row, 'coach_comments'),
      development_goals: splitRosterItems(rowValue(row, 'development_goals')),
      awards: splitRosterItems(rowValue(row, 'awards')),
      gamechanger_name: rowValue(row, 'gamechanger_name') || name,
      gamechanger_player_id: '',
      social: {
        instagram: rowValue(row, 'instagram'),
        x: rowValue(row, 'x')
      },
      qa: {
        favorite_mlb_player: rowValue(row, 'favorite_mlb_player'),
        favorite_team: rowValue(row, 'favorite_team'),
        favorite_baseball_memory: rowValue(row, 'favorite_baseball_memory'),
        walkup_song: rowValue(row, 'walkup_song'),
        favorite_food: rowValue(row, 'favorite_food'),
        hidden_talent: rowValue(row, 'hidden_talent')
      },
      _import: { rowNumber, errors, warnings }
    };
    return player;
  }

  function buildNormalizedRoster() {
    rosterImportState.normalizedPlayers = rosterImportState.rows
      .map((row, index) => buildImportedPlayer(row, index + 2))
      .filter(player => player.name || player._import.errors.length);
  }

  function renderRosterReview() {
    buildNormalizedRoster();
    const body = document.getElementById('rosterReviewBody');
    const valid = rosterImportState.normalizedPlayers.filter(p => !p._import.errors.length);
    const errors = rosterImportState.normalizedPlayers.filter(p => p._import.errors.length);
    const warnings = rosterImportState.normalizedPlayers.reduce((sum, p) => sum + p._import.warnings.length, 0);

    document.getElementById('rosterReviewSummary').textContent =
      `${valid.length} valid players · ${errors.length} rows with errors · ${warnings} warnings`;

    body.innerHTML = rosterImportState.normalizedPlayers.map(player => {
      const hasError = player._import.errors.length > 0;
      const hasWarning = player._import.warnings.length > 0;
      const status = hasError ? 'Error' : hasWarning ? 'Review' : 'Ready';
      const title = [...player._import.errors, ...player._import.warnings].join('; ');
      return `
        <tr class="${hasError ? 'import-error-row' : hasWarning ? 'import-warning-row' : ''}">
          <td><span class="roster-import-status ${status.toLowerCase()}" title="${title}">${status}</span></td>
          <td>${player.number || '—'}</td>
          <td><strong>${player.name || 'Missing name'}</strong></td>
          <td>${player.position || '—'}</td>
          <td>${player.college || '—'}</td>
          <td>${player.hometown || '—'}</td>
          <td>${player.class || '—'}</td>
          <td>${player.photo ? 'Yes' : 'No'}</td>
        </tr>`;
    }).join('');
  }

  function showRosterImportStep(step) {
    document.querySelectorAll('.import-step').forEach(section => {
      section.classList.toggle('active', Number(section.dataset.importStep) === step);
    });
    document.querySelectorAll('[data-import-step-indicator]').forEach(indicator => {
      const value = Number(indicator.dataset.importStepIndicator);
      indicator.classList.toggle('active', value === step);
      indicator.classList.toggle('complete', value < step);
    });
  }

  document.getElementById('rosterImportFile')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    const summary = document.getElementById('rosterImportFileSummary');
    const next = document.getElementById('rosterImportNext1');
    if (!file) return;

    try {
      const matrix = await readRosterFile(file);
      if (matrix.length < 2) throw new Error('The roster file has no player rows.');
      rosterImportState.headers = matrix[0].map(value => String(value).trim());
      rosterImportState.rows = matrix.slice(1).filter(row => row.some(value => String(value).trim()));
      autoMapRosterColumns();
      summary.textContent = `${file.name} · ${rosterImportState.rows.length} player rows detected`;
      next.disabled = false;
    } catch (error) {
      summary.textContent = error.message;
      next.disabled = true;
    }
  });

  document.getElementById('rosterImportNext1')?.addEventListener('click', () => {
    renderRosterMapping();
    showRosterImportStep(2);
  });

  document.getElementById('rosterImportNext2')?.addEventListener('click', () => {
    if (rosterImportState.mapping.name === '' || rosterImportState.mapping.name === undefined) {
      showToast('Map the Full Name column before continuing.');
      return;
    }
    renderRosterReview();
    showRosterImportStep(3);
  });

  document.querySelectorAll('[data-roster-back]').forEach(button => {
    button.addEventListener('click', () => showRosterImportStep(Number(button.dataset.rosterBack)));
  });

  document.getElementById('rosterImportApply')?.addEventListener('click', () => {
    const validPlayers = rosterImportState.normalizedPlayers
      .filter(player => !player._import.errors.length)
      .map(player => {
        const clean = { ...player };
        delete clean._import;
        return clean;
      });

    if (!validPlayers.length) {
      showToast('No valid players are available to import.');
      return;
    }

    const replace = document.getElementById('replaceRosterMode').checked;
    if (replace) {
      state.roster = validPlayers;
    } else {
      const bySlug = new Map(state.roster.map(player => [player.slug, player]));
      validPlayers.forEach(player => bySlug.set(player.slug, { ...bySlug.get(player.slug), ...player }));
      state.roster = Array.from(bySlug.values());
    }

    if (!state.playerStats) state.playerStats = {};
    validPlayers.forEach(player => {
      if (!state.playerStats[player.slug]) {
        state.playerStats[player.slug] = {
          type: String(player.position || '').toUpperCase().includes('P') ? 'pitcher' : 'hitter',
          season: {
            games: 0, avg: '.000', obp: '.000', slg: '.000', ops: '.000',
            hits: 0, hr: 0, rbi: 0, runs: 0, sb: 0,
            appearances: 0, innings: '0.0', era: '0.00', whip: '0.00',
            strikeouts: 0, walks: 0, wins: 0, saves: 0
          },
          game_log: [],
          highlights: []
        };
      }
    });

    saveLocal('roster');
    localStorage.setItem('tribe-admin-playerStats', JSON.stringify(state.playerStats));
    renderAll();
    document.getElementById('rosterImportCompleteSummary').textContent =
      `${validPlayers.length} players were imported. Export roster.json and player-stats.json to publish them.`;
    showRosterImportStep(4);
    showToast('Roster import applied.');
  });

  document.getElementById('rosterImportReset')?.addEventListener('click', () => {
    rosterImportState.headers = [];
    rosterImportState.rows = [];
    rosterImportState.mapping = {};
    rosterImportState.normalizedPlayers = [];
    document.getElementById('rosterImportFile').value = '';
    document.getElementById('rosterImportFileSummary').textContent = 'No roster file selected.';
    document.getElementById('rosterImportNext1').disabled = true;
    showRosterImportStep(1);
  });


  function renderAll() {
    renderDashboard();
    renderPlayerList();
    renderGameList();
    renderNewsList();
    renderSponsorList();
    renderStatsForm();
    renderGcConfig();
  }

  loadData().catch(error => {
    console.error(error);
    showToast('Unable to load website data.');
  });
})();
