
(() => {
  const standingsBody = document.getElementById('standingsBody');
  const teamGrid = document.getElementById('leagueTeamGrid');
  if (!standingsBody || !teamGrid) return;

  fetch('data/standings.json')
    .then(r => r.json())
    .then(teams => {
      standingsBody.innerHTML = teams.map((team, index) => `
        <tr class="${team.slug === 'colorado-tribe' ? 'tribe-row' : ''}">
          <td>
            <a class="standings-team" href="teams/${team.slug}.html">
              <span>${index + 1}</span>
              <img src="${team.logo.replace('../','')}" alt="${team.name}">
              <strong>${team.name}</strong>
            </a>
          </td>
          <td>${team.wins}</td>
          <td>${team.losses}</td>
          <td>${team.pct}</td>
          <td>${team.gb}</td>
          <td>${team.last10}</td>
          <td>${team.streak}</td>
        </tr>
      `).join('');

      teamGrid.innerHTML = teams.map(team => `
        <article class="league-team-card">
          <div class="league-team-logo">
            <img src="${team.logo.replace('../','')}" alt="${team.name}">
          </div>
          <div class="league-team-copy">
            <span>${team.city}</span>
            <h3>${team.name}</h3>
            <p>${team.description}</p>
            <a href="teams/${team.slug}.html">Team Profile →</a>
          </div>
        </article>
      `).join('');
    });
})();
