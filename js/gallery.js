
(() => {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  fetch('data/galleries.json')
    .then(r => r.json())
    .then(items => {
      grid.innerHTML = items.map(item => `
        <article class="content-card">
          <div class="content-card-image">
            ${item.cover ? `<img src="${item.cover}" alt="${item.title}">` : '<span>Gallery Cover</span>'}
          </div>
          <div class="content-card-copy">
            <span>${item.category}</span>
            <h2>${item.title}</h2>
            <p>${item.photos.length} photos</p>
            <a href="#">Gallery Coming Soon →</a>
          </div>
        </article>
      `).join('');
    });
})();
