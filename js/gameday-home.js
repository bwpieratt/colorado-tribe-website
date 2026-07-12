
(() => {
  fetch('data/games.json')
    .then(r => r.json())
    .then(games => {
      const completed = games
        .filter(g => (g.status || g.live_status) === 'Final')
        .sort((a,b) => new Date(b.date) - new Date(a.date));

      const card = document.getElementById('latestResultCard');
      if (!card) return;

      if (!completed.length) {
        card.innerHTML = '<p>No completed games yet.</p>';
        return;
      }

      const game = completed[0];
      card.innerHTML = `
        <div class="gdc-latest-team">
          <img src="images/logos/tribe-logo.png" alt="Colorado Tribe">
          <strong>Colorado Tribe</strong>
          <span>${game.tribe_score || '—'}</span>
        </div>
        <div class="gdc-latest-final">Final</div>
        <div class="gdc-latest-team">
          <img src="${game.opponent_logo.replace('../','')}" alt="${game.opponent}">
          <strong>${game.opponent}</strong>
          <span>${game.opponent_score || '—'}</span>
        </div>
        <a href="games/${game.slug}.html">Read Recap →</a>
      `;
    });
})();
