
(() => {
  const newsGrid = document.getElementById('homepageNewsGrid');
  if (newsGrid) {
    fetch('data/news.json')
      .then(r => r.json())
      .then(items => {
        newsGrid.innerHTML = items.slice(0,3).map((item,index) => `
          <article class="v8-news-card ${index === 0 ? 'featured' : ''}">
            <span>${item.category}</span>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <a href="articles/${item.slug}.html">Read More →</a>
          </article>
        `).join('');
      });
  }

  fetch('data/sponsors.json')
    .then(r => r.json())
    .then(items => {
      const sponsorRow = document.querySelector('.v8-sponsor-carousel');
      if (!sponsorRow) return;
      sponsorRow.innerHTML = items.map(item => `
        <a class="homepage-sponsor-card" href="${item.website || 'sponsors.html'}">
          ${item.logo ? `<img src="${item.logo}" alt="${item.name}">` : `<span>${item.name}</span>`}
        </a>
      `).join('');
    });
})();
