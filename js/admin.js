
(() => {
  const state = {
    roster: [],
    games: [],
    news: [],
    sponsors: [],
    stats: {}
  };

  const paths = {
    roster: '../data/roster.json',
    games: '../data/games.json',
    news: '../data/news.json',
    sponsors: '../data/sponsors.json',
    stats: '../data/stats.json'
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
      photo: document.getElementById('playerPhoto').value.trim()
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
      recap: document.getElementById('gameRecap').value.trim()
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

  function renderAll() {
    renderDashboard();
    renderPlayerList();
    renderGameList();
    renderNewsList();
    renderSponsorList();
    renderStatsForm();
  }

  loadData().catch(error => {
    console.error(error);
    showToast('Unable to load website data.');
  });
})();
