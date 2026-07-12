
(() => {
  const grid = document.getElementById('rosterGrid');
  if (!grid) return;

  const search = document.getElementById('rosterSearch');
  const positionFilter = document.getElementById('positionFilter');
  const classFilter = document.getElementById('classFilter');
  const empty = document.getElementById('rosterEmpty');
  const playerCount = document.getElementById('playerCount');
  const collegeCount = document.getElementById('collegeCount');
  const stateCount = document.getElementById('stateCount');

  let players = [];
  let stats = {};

  function positionGroup(position) {
    const value = String(position || '').toUpperCase();
    if (value.includes('TWO')) return 'TWO-WAY';
    if (value.includes('P')) return 'P';
    if (value.includes('C')) return 'C';
    if (value.includes('INF') || ['1B','2B','3B','SS'].includes(value)) return 'INF';
    if (value.includes('OF')) return 'OF';
    return 'UTIL';
  }

  function initials(name) {
    return String(name || 'Player')
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function statLine(player) {
    const s = stats[player.slug]?.season || {};
    const pitcher = stats[player.slug]?.type === 'pitcher';
    if (pitcher) {
      return `
        <div class="player-card-stats">
          <div><strong>${s.era ?? '0.00'}</strong><span>ERA</span></div>
          <div><strong>${s.strikeouts ?? 0}</strong><span>SO</span></div>
          <div><strong>${s.whip ?? '0.00'}</strong><span>WHIP</span></div>
        </div>`;
    }
    return `
      <div class="player-card-stats">
        <div><strong>${s.avg ?? '.000'}</strong><span>AVG</span></div>
        <div><strong>${s.hr ?? 0}</strong><span>HR</span></div>
        <div><strong>${s.rbi ?? 0}</strong><span>RBI</span></div>
      </div>`;
  }

  function collegeLogo(player) {
    return player.college_logo
      ? `<img class="player-college-logo" src="${player.college_logo}" alt="${player.college} logo">`
      : `<span class="player-college-mark">${initials(player.college)}</span>`;
  }

  function playerCard(player) {
    const photo = player.photo
      ? `<img src="${player.photo}" alt="${player.name}">`
      : `<div class="player-photo-placeholder"><span>${initials(player.name)}</span><small>Player Photo</small></div>`;

    return `
      <article class="player-card" data-position="${positionGroup(player.position)}">
        <div class="player-card-photo">
          ${photo}
          <span class="player-number">#${player.number}</span>
        </div>
        <div class="player-card-body">
          <div class="player-card-heading">
            <div>
              <span class="player-position">${player.position}</span>
              <h2>${player.name}</h2>
            </div>
            ${collegeLogo(player)}
          </div>
          <p class="player-college">${player.college}</p>
          ${statLine(player)}
          <dl class="player-details">
            <div><dt>Hometown</dt><dd>${player.hometown}</dd></div>
            <div><dt>Height / Weight</dt><dd>${player.height || '—'} / ${player.weight || '—'}</dd></div>
            <div><dt>Bats / Throws</dt><dd>${player.bats || '—'} / ${player.throws || '—'}</dd></div>
            <div><dt>Class</dt><dd>${player.class || '—'}</dd></div>
          </dl>
          <a class="player-profile-link" href="players/${player.slug}.html">View Profile →</a>
        </div>
      </article>
    `;
  }

  function updateSummary(filtered) {
    playerCount.textContent = filtered.length;
    collegeCount.textContent = new Set(filtered.map(p => p.college).filter(Boolean)).size;
    stateCount.textContent = new Set(
      filtered.map(p => (p.hometown || '').split(',').pop().trim()).filter(Boolean)
    ).size;
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const position = positionFilter.value;
    const classValue = classFilter?.value || 'all';

    const filtered = players.filter(player => {
      const haystack = [
        player.name,
        player.position,
        player.college,
        player.hometown,
        player.class
      ].join(' ').toLowerCase();

      return (!query || haystack.includes(query))
        && (position === 'all' || positionGroup(player.position) === position)
        && (classValue === 'all' || player.class === classValue);
    });

    grid.innerHTML = filtered.map(playerCard).join('');
    empty.hidden = filtered.length !== 0;
    updateSummary(filtered);
  }

  Promise.all([
    fetch('data/roster.json').then(r => r.json()),
    fetch('data/player-stats.json').then(r => r.json())
  ]).then(([rosterData, statsData]) => {
    players = rosterData;
    stats = statsData;
    render();
  }).catch(error => {
    grid.innerHTML = `<p class="roster-load-error">${error.message}</p>`;
  });

  search.addEventListener('input', render);
  positionFilter.addEventListener('change', render);
  classFilter?.addEventListener('change', render);
})();
