
(() => {
  const slug = document.body.dataset.playerSlug;
  if (!slug) return;

  const initials = value => String(value || '')
    .split(/\s+/).map(v => v[0]).join('').slice(0,2).toUpperCase();

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
  };

  function listOrPlaceholder(items, placeholder) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    return values.length
      ? values.map(item => `<li>${item}</li>`).join('')
      : `<li class="player-v11-muted">${placeholder}</li>`;
  }

  function qaRows(qa = {}) {
    const questions = [
      ['favorite_mlb_player', 'Favorite MLB Player'],
      ['favorite_team', 'Favorite Team'],
      ['favorite_baseball_memory', 'Favorite Baseball Memory'],
      ['walkup_song', 'Walk-Up Song'],
      ['favorite_food', 'Favorite Food'],
      ['hidden_talent', 'Hidden Talent']
    ];
    return questions.map(([key,label]) => `
      <div><span>${label}</span><strong>${qa[key] || 'Coming soon'}</strong></div>
    `).join('');
  }

  function hitterStats(s) {
    return [
      ['Games', s.games ?? 0],
      ['AVG', s.avg ?? '.000'],
      ['OBP', s.obp ?? '.000'],
      ['SLG', s.slg ?? '.000'],
      ['OPS', s.ops ?? '.000'],
      ['Hits', s.hits ?? 0],
      ['HR', s.hr ?? 0],
      ['RBI', s.rbi ?? 0],
      ['Runs', s.runs ?? 0],
      ['SB', s.sb ?? 0]
    ];
  }

  function pitcherStats(s) {
    return [
      ['Appearances', s.appearances ?? 0],
      ['Innings', s.innings ?? '0.0'],
      ['ERA', s.era ?? '0.00'],
      ['WHIP', s.whip ?? '0.00'],
      ['Strikeouts', s.strikeouts ?? 0],
      ['Walks', s.walks ?? 0],
      ['Wins', s.wins ?? 0],
      ['Saves', s.saves ?? 0]
    ];
  }

  Promise.all([
    fetch('../data/roster.json').then(r => r.json()),
    fetch('../data/player-stats.json').then(r => r.json())
  ]).then(([roster, stats]) => {
    const player = roster.find(p => p.slug === slug);
    if (!player) throw new Error('Player not found.');
    const playerStats = stats[slug] || { type: 'hitter', season: {}, game_log: [], highlights: [] };
    const season = playerStats.season || {};

    setText('playerNumber', `#${player.number || '—'}`);
    setText('playerEyebrow', `${player.position || 'Position'} · ${player.college || 'College / University'}`);
    setText('playerName', player.name);
    setText('playerFirstName', String(player.name || '').split(' ')[0] || 'the Player');
    setText('playerHometown', player.hometown || '');
    setText('playerWhyTribe', player.why_tribe || 'Player statement coming soon.');
    setText('playerCoachComments', player.coach_comments || 'Coach comments coming soon.');

    const photo = document.getElementById('playerHeroPhoto');
    photo.innerHTML = player.photo
      ? `<img src="../${player.photo}" alt="${player.name}">`
      : `<div class="player-photo-placeholder large"><span>${initials(player.name)}</span><small>Player Photo</small></div>`;

    document.getElementById('playerFacts').innerHTML = [
      ['Height', player.height || '—'],
      ['Weight', player.weight || '—'],
      ['Bats', player.bats || '—'],
      ['Throws', player.throws || '—'],
      ['Class', player.class || '—']
    ].map(([label,value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');

    document.getElementById('playerCollegeBlock').innerHTML = `
      ${player.college_logo
        ? `<img src="../${player.college_logo}" alt="${player.college} logo">`
        : `<span>${initials(player.college)}</span>`}
      <div><small>College</small><strong>${player.college || 'College / University'}</strong></div>
    `;

    document.getElementById('playerBio').innerHTML = player.bio
      ? player.bio.split(/\n\s*\n/).map(p => `<p>${p}</p>`).join('')
      : '<p>Player biography coming soon.</p>';

    const statPairs = playerStats.type === 'pitcher' ? pitcherStats(season) : hitterStats(season);
    document.getElementById('playerStatGrid').innerHTML = statPairs.map(([label,value]) => `
      <div><strong>${value}</strong><span>${label}</span></div>
    `).join('');

    const gameLog = Array.isArray(playerStats.game_log) ? playerStats.game_log : [];
    document.getElementById('playerGameLog').innerHTML = gameLog.length
      ? gameLog.map(game => `
          <div class="player-v11-game-row">
            <span>${game.date || ''}</span>
            <strong>${game.opponent || ''}</strong>
            <em>${game.line || ''}</em>
          </div>`).join('')
      : '<p class="player-v11-muted">Game log will appear after the season begins.</p>';

    document.getElementById('playerQA').innerHTML = qaRows(player.qa);
    document.getElementById('playerInfoList').innerHTML = [
      ['College', player.college],
      ['Major', player.major],
      ['Hometown', player.hometown],
      ['High School', player.high_school],
      ['Position', player.position],
      ['Class', player.class]
    ].map(([label,value]) => `<div><dt>${label}</dt><dd>${value || '—'}</dd></div>`).join('');

    document.getElementById('playerGoals').innerHTML = listOrPlaceholder(
      player.development_goals, 'Development goals coming soon.'
    );
    document.getElementById('playerAwards').innerHTML = listOrPlaceholder(
      player.awards, 'Awards and honors coming soon.'
    );

    const media = [];
    if (player.action_photo) media.push(`<div><img src="../${player.action_photo}" alt="${player.name} action photo"></div>`);
    (playerStats.highlights || []).forEach(item => {
      if (item.image) media.push(`<div><img src="../${item.image}" alt="${item.title || 'Player highlight'}"></div>`);
      else if (item.url) media.push(`<a href="${item.url}" target="_blank" rel="noopener">${item.title || 'View Highlight'}</a>`);
    });
    while (media.length < 3) media.push('<div class="player-v11-media-placeholder">Player Media</div>');
    document.getElementById('playerMediaGrid').innerHTML = media.slice(0,3).join('');
  }).catch(error => {
    document.querySelector('.player-v11-page').innerHTML = `<p class="roster-load-error">${error.message}</p>`;
  });
})();
