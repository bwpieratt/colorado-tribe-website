
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
})();



(() => {
  const modal = document.getElementById('directionsModal');
  const locationText = document.getElementById('directionsLocation');
  const google = document.getElementById('googleMapsLink');
  const apple = document.getElementById('appleMapsLink');
  const waze = document.getElementById('wazeLink');
  const closeButton = modal.querySelector('.directions-close');

  function openModal(button) {
    locationText.textContent = button.dataset.location || 'Game venue';
    google.href = button.dataset.google;
    apple.href = button.dataset.apple;
    waze.href = button.dataset.waze;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.directions-trigger').forEach(button => {
    button.addEventListener('click', () => openModal(button));
  });

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();



(() => {
  const toast = document.getElementById('setupToast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
  }

  // GameChanger links: enter a team page or individual game URL in data-url.
  document.querySelectorAll('.gamechanger-link').forEach(link => {
    if (!link.dataset.url) link.classList.add('is-unset');
    link.addEventListener('click', event => {
      const url = link.dataset.url;
      if (!url) {
        event.preventDefault();
        showToast('GameChanger link not connected yet. Paste the team or game URL into this button’s data-url value.');
        return;
      }
      event.preventDefault();
      window.open(url, '_blank', 'noopener');
    });
  });


  // Records update automatically after data-result is set to W, L, or T.
  function recordFor(cards) {
    let w=0,l=0,t=0;
    cards.forEach(card => {
      const result = (card.dataset.result || '').toUpperCase();
      if (result === 'W') w++;
      if (result === 'L') l++;
      if (result === 'T') t++;
    });
    return t ? `${w}–${l}–${t}` : `${w}–${l}`;
  }

  const cards = [...document.querySelectorAll('.game-card')];
  document.getElementById('overallRecord').textContent = recordFor(cards);
  document.getElementById('homeRecord').textContent = recordFor(cards.filter(c => c.classList.contains('home')));
  document.getElementById('awayRecord').textContent = recordFor(cards.filter(c => c.classList.contains('away')));

})();
