
(() => {
  const teamStats = document.getElementById('teamStats');
  const batting = document.getElementById('battingLeaders');
  const pitching = document.getElementById('pitchingLeaders');
  if (!teamStats || !batting || !pitching) return;

  fetch('data/stats.json')
    .then(r => r.json())
    .then(data => {
      const t = data.team;
      teamStats.innerHTML = `
        <article><span>Games</span><strong>${t.games}</strong></article>
        <article><span>Wins</span><strong>${t.wins}</strong></article>
        <article><span>Losses</span><strong>${t.losses}</strong></article>
        <article><span>Runs Scored</span><strong>${t.runs_scored}</strong></article>
        <article><span>Runs Allowed</span><strong>${t.runs_allowed}</strong></article>
      `;

      batting.innerHTML = data.batting_leaders.map((p,i) => `
        <div class="leader-row">
          <span>${i+1}</span><strong>${p.name}</strong>
          <em>${p.avg} AVG</em><em>${p.hr} HR</em><em>${p.rbi} RBI</em><em>${p.ops} OPS</em>
        </div>
      `).join('');

      pitching.innerHTML = data.pitching_leaders.map((p,i) => `
        <div class="leader-row">
          <span>${i+1}</span><strong>${p.name}</strong>
          <em>${p.era} ERA</em><em>${p.wins} W</em><em>${p.so} SO</em><em>${p.whip} WHIP</em>
        </div>
      `).join('');
    });
})();
