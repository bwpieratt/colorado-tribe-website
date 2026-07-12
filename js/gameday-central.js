
(() => {
  const slug = document.body.dataset.gameSlug;
  if (!slug) return;

  const qs = id => document.getElementById(id);
  const safeList = value => Array.isArray(value) ? value : [];

  function statusClass(status) {
    return String(status || 'Scheduled').toLowerCase().replace(/\s+/g, '-');
  }

  function formatCountdown(dateString, timeString) {
    if (!dateString || !timeString || timeString.includes('/')) return '';
    const parsedTime = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!parsedTime) return '';
    let hour = Number(parsedTime[1]);
    const minute = Number(parsedTime[2]);
    const meridiem = parsedTime[3].toUpperCase();
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    const gameDate = new Date(`${dateString}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00-06:00`);
    const diff = gameDate.getTime() - Date.now();
    if (diff <= 0) return '';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h to first pitch`;
    return `${hours}h ${mins}m to first pitch`;
  }

  function lineups(items) {
    return safeList(items).length
      ? safeList(items).map(item => `<li><span>${item.position || ''}</span><strong>${item.name || item}</strong></li>`).join('')
      : '<li class="gdc-muted">Lineup will be posted before first pitch.</li>';
  }

  function mediaItems(game) {
    const items = [];
    safeList(game.photos).forEach(photo => items.push(
      `<div><img src="../${photo}" alt="Game photo"></div>`
    ));
    safeList(game.videos).forEach(video => items.push(
      `<a href="${video.url || '#'}" target="_blank" rel="noopener">${video.title || 'Watch Highlight'}</a>`
    ));
    while (items.length < 3) items.push('<div class="gdc-media-placeholder">Game Media</div>');
    return items.slice(0, 6).join('');
  }

  fetch('../data/games.json')
    .then(r => r.json())
    .then(games => {
      const game = games.find(g => g.slug === slug);
      if (!game) throw new Error('Game not found.');

      const status = game.status || game.live_status || 'Scheduled';
      const scoreboard = qs('gdcScoreboard');
      scoreboard.classList.add(`status-${statusClass(status)}`);
      qs('gdcStatus').textContent = status;
      qs('gdcCountdown').textContent = formatCountdown(game.date, game.time);

      qs('gdcOpponent').textContent = game.opponent;
      qs('gdcOpponentLogo').src = game.opponent_logo;
      qs('gdcOpponentLogo').alt = game.opponent;
      qs('gdcTribeScore').textContent = game.tribe_score || '—';
      qs('gdcOpponentScore').textContent = game.opponent_score || '—';
      qs('gdcFinalLabel').textContent = status === 'Final' ? 'Final' : 'Game Day Central';

      qs('gdcMeta').innerHTML = [
        ['Date', game.display_date || game.date],
        ['Time', game.time],
        ['Venue', game.venue],
        ['Format', game.format || 'Game'],
        ['Weather', game.weather || 'TBA'],
        ['Attendance', game.attendance || 'TBA']
      ].map(([label,value]) => `<div><span>${label}</span><strong>${value || 'TBA'}</strong></div>`).join('');

      const gc = qs('gdcGameChanger');
      const gcUrl = game.gamechanger_url || game.gamechanger;
      if (gcUrl) gc.href = gcUrl;
      else {
        gc.href = '../gamechanger.html';
        gc.textContent = 'GameChanger Hub';
      }

      const box = qs('gdcBoxScore');
      const boxUrl = game.box_score_pdf || game.box_score;
      if (boxUrl) box.href = boxUrl;
      else {
        box.href = '#';
        box.addEventListener('click', e => e.preventDefault());
        box.classList.add('gdc-disabled');
        box.textContent = 'Box Score Coming Soon';
      }

      const location = game.venue || '';
      const query = encodeURIComponent(location);
      const dir = qs('gdcDirections');
      dir.dataset.location = location;
      dir.dataset.google = `https://www.google.com/maps/search/?api=1&query=${query}`;
      dir.dataset.apple = `https://maps.apple.com/?q=${query}`;
      dir.dataset.waze = `https://www.waze.com/ul?q=${query}&navigate=yes`;

      qs('gdcStarters').innerHTML = `
        <div><span>Colorado Tribe</span><strong>${game.starting_pitcher_tribe || 'TBA'}</strong></div>
        <div><span>${game.opponent}</span><strong>${game.starting_pitcher_opponent || 'TBA'}</strong></div>
      `;

      qs('gdcInfoList').innerHTML = [
        ['Parking', game.parking || 'Parking information coming soon.'],
        ['Admission', game.admission || 'Admission information coming soon.'],
        ['Weather', game.weather || 'Forecast coming soon.'],
        ['Time of Game', game.time_of_game || 'TBA']
      ].map(([label,value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');

      qs('gdcTribeLineup').innerHTML = lineups(game.lineup_tribe);
      qs('gdcOpponentLineup').innerHTML = lineups(game.lineup_opponent);
      qs('gdcOpponentLineupTitle').textContent = game.opponent;

      qs('gdcRecap').innerHTML = game.recap
        ? `<p>${String(game.recap).replace(/\n\s*\n/g,'</p><p>')}</p>`
        : '<p class="gdc-muted">Game recap will be added after the final out.</p>';

      qs('gdcCoachQuote').textContent = game.coach_quote || 'Coach quote coming soon.';

      const potg = game.player_of_game || {};
      qs('gdcPotg').innerHTML = potg.name
        ? `
          <div class="gdc-potg-photo">${potg.photo ? `<img src="../${potg.photo}" alt="${potg.name}">` : 'Player Photo'}</div>
          <div><h3>${potg.name}</h3><p>${potg.line || ''}</p><blockquote>${potg.quote || ''}</blockquote></div>`
        : '<p class="gdc-muted">Player of the Game will be selected after the game.</p>';

      const performances = safeList(game.key_performances);
      qs('gdcPerformances').innerHTML = performances.length
        ? performances.map(item => `<div><strong>${item.name || ''}</strong><span>${item.line || item.description || ''}</span></div>`).join('')
        : '<div class="gdc-performance-placeholder">Key performances will appear here after the game.</div>';

      qs('gdcMedia').innerHTML = mediaItems(game);
    })
    .catch(error => {
      document.querySelector('.gdc-page').innerHTML = `<p class="roster-load-error">${error.message}</p>`;
    });
})();
