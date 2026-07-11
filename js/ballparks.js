
(() => {
  const grid = document.getElementById('ballparkGrid');
  const search = document.getElementById('ballparkSearch');
  if (!grid || !search) return;
  let parks = [];

  function render() {
    const q = search.value.toLowerCase().trim();
    const filtered = parks.filter(park =>
      [park.name, park.short_name, park.city].join(' ').toLowerCase().includes(q)
    );

    grid.innerHTML = filtered.map(park => `
      <article class="ballpark-card">
        <div class="ballpark-photo">${park.photo ? `<img src="${park.photo}" alt="${park.name}">` : '<span>Venue Photo</span>'}</div>
        <div class="ballpark-copy">
          <span>${park.city}</span>
          <h2>${park.name}</h2>
          <p>${park.notes || 'Colorado Tribe game venue.'}</p>
          <a href="ballparks/${park.slug}.html">View Ballpark Guide →</a>
        </div>
      </article>
    `).join('');
  }

  fetch('data/ballparks.json')
    .then(r => r.json())
    .then(data => {
      parks = data;
      render();
    });

  search.addEventListener('input', render);
})();
