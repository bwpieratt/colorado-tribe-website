
(() => {
  const countdown = document.getElementById('openingCountdown');

  function updateCountdown() {
    if (!countdown) return;
    const gameTime = new Date('2026-05-30T10:00:00-06:00');
    const diff = gameTime.getTime() - Date.now();
    if (diff <= 0) {
      countdown.textContent = 'Game Day';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    countdown.textContent = `${days}d ${hours}h`;
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);

  fetch('data/homepage.json')
    .then(r => r.json())
    .then(data => {
      const record = document.getElementById('homeRecord');
      const standing = document.getElementById('homeStanding');
      if (record) record.textContent = data.record || '0–0';
      if (standing) standing.textContent = data.league_position || 'Preseason';

      const player = data.featured_player || {};
      const name = document.getElementById('featuredPlayerName');
      const position = document.getElementById('featuredPlayerPosition');
      const college = document.getElementById('featuredPlayerCollege');
      const link = document.getElementById('featuredPlayerLink');
      const photo = document.getElementById('featuredPlayerPhoto');

      if (name) name.textContent = player.name || 'Player Spotlight';
      if (position) position.textContent = player.position || 'Position';
      if (college) college.textContent = player.college || 'College / University';
      if (link && player.profile) link.href = player.profile;
      if (photo && player.photo) {
        photo.innerHTML = `<img src="${player.photo}" alt="${player.name || 'Featured player'}">`;
      }
    });

  fetch('data/standings.json')
    .then(r => r.json())
    .then(teams => {
      const target = document.getElementById('homepageStandings');
      if (!target) return;
      target.innerHTML = teams.slice(0, 4).map(team => `
        <a class="v8-standings-row ${team.slug === 'colorado-tribe' ? 'tribe' : ''}" href="teams/${team.slug}.html">
          <span class="v8-standings-team">
            <img src="${team.logo.replace('../','')}" alt="${team.name}">
            <strong>${team.name}</strong>
          </span>
          <span>${team.wins}</span>
          <span>${team.losses}</span>
          <span>${team.pct}</span>
        </a>
      `).join('');
    });
})();
