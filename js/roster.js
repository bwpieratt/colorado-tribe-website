
(() => {
  const grid = document.getElementById('rosterGrid');
  if (!grid) return;

  const search = document.getElementById('rosterSearch');
  const positionFilter = document.getElementById('positionFilter');
  const empty = document.getElementById('rosterEmpty');
  const playerCount = document.getElementById('playerCount');
  const collegeCount = document.getElementById('collegeCount');
  const stateCount = document.getElementById('stateCount');

  let players = [];

  function positionGroup(position) {
    const value = String(position || '').toUpperCase();
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
          <span class="player-position">${player.position}</span>
          <h2>${player.name}</h2>
          <p class="player-college">${player.college}</p>
          <dl class="player-details">
            <div><dt>Hometown</dt><dd>${player.hometown}</dd></div>
            <div><dt>Height / Weight</dt><dd>${player.height} / ${player.weight}</dd></div>
            <div><dt>Bats / Throws</dt><dd>${player.bats} / ${player.throws}</dd></div>
            <div><dt>Class</dt><dd>${player.class}</dd></div>
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

    const filtered = players.filter(player => {
      const haystack = [
        player.name,
        player.position,
        player.college,
        player.hometown
      ].join(' ').toLowerCase();

      const matchesQuery = !query || haystack.includes(query);
      const matchesPosition = position === 'all' || positionGroup(player.position) === position;
      return matchesQuery && matchesPosition;
    });

    grid.innerHTML = filtered.map(playerCard).join('');
    empty.hidden = filtered.length !== 0;
    updateSummary(filtered);
  }

  fetch('data/roster.json')
    .then(response => {
      if (!response.ok) throw new Error('Unable to load roster data.');
      return response.json();
    })
    .then(data => {
      players = data;
      render();
    })
    .catch(error => {
      grid.innerHTML = `<p class="roster-load-error">${error.message}</p>`;
    });

  search.addEventListener('input', render);
  positionFilter.addEventListener('change', render);
})();
