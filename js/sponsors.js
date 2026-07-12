
(() => {
  const directory = document.getElementById('sponsorDirectory');
  if (!directory) return;

  fetch('data/sponsors.json')
    .then(r => r.json())
    .then(items => {
      const tiers = [...new Set(items.map(i => i.tier))];
      directory.innerHTML = tiers.map(tier => `
        <section class="sponsor-tier-section">
          <div class="sponsor-tier-heading"><p class="section-kicker">${tier}</p><h2>${tier} Partners</h2></div>
          <div class="sponsor-card-grid">
            ${items.filter(i => i.tier === tier).map(item => `
              <article class="sponsor-card-v9">
                <div class="sponsor-logo-v9">
                  ${item.logo ? `<img src="${item.logo}" alt="${item.name}">` : '<span>Sponsor Logo</span>'}
                </div>
                <div>
                  <h3>${item.name}</h3>
                  <p>${item.description}</p>
                  ${item.website ? `<a href="${item.website}" target="_blank" rel="noopener">Visit Website →</a>` : '<span class="gamecenter-muted">Website link coming soon.</span>'}
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      `).join('');
    });
})();
