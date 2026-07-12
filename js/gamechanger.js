
(() => {
  fetch('data/gamechanger.json')
    .then(r => r.json())
    .then(config => {
      const link = document.getElementById('gcTeamLink');
      const message = document.getElementById('gcSetupMessage');
      if (config.team_url) {
        link.href = config.team_url;
        link.textContent = config.live_label || 'Open GameChanger';
        message.hidden = true;
      } else {
        link.addEventListener('click', event => event.preventDefault());
        link.classList.add('gamecenter-disabled');
        message.hidden = false;
      }
    });
})();
