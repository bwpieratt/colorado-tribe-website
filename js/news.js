
(() => {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;
  const search = document.getElementById('newsSearch');
  const category = document.getElementById('newsCategory');
  let items = [];

  function render() {
    const q = search.value.toLowerCase().trim();
    const c = category.value;
    const filtered = items.filter(item => {
      const matchesSearch = [item.title,item.summary,item.category].join(' ').toLowerCase().includes(q);
      const matchesCategory = c === 'all' || item.category === c;
      return matchesSearch && matchesCategory;
    });

    grid.innerHTML = filtered.map(item => `
      <article class="content-card ${item.featured ? 'featured' : ''}">
        <div class="content-card-image">
          ${item.image ? `<img src="${item.image}" alt="${item.title}">` : '<span>Article Image</span>'}
        </div>
        <div class="content-card-copy">
          <span>${item.category}</span>
          <h2>${item.title}</h2>
          <p>${item.summary}</p>
          <a href="articles/${item.slug}.html">Read More →</a>
        </div>
      </article>
    `).join('');
  }

  fetch('data/news.json')
    .then(r => r.json())
    .then(data => { items = data; render(); });

  search.addEventListener('input', render);
  category.addEventListener('change', render);
})();
