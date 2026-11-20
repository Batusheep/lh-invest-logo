function productDocument(interfaceSource) {
  let source = interfaceSource
  source = source.replace("|| 'auth-register', false, false)", "|| 'inv-overview', false, false)")
  source = source.replace('</head>', `<style>.demobar{display:none!important}:root{--demo-h:0px!important}html,body{scrollbar-gutter:stable}.side .brand{visibility:hidden}.side .brand:has(.brand-mark[data-logo-ready]){visibility:visible}.side .brand-mark img{width:32px;height:32px;object-fit:contain}</style></head>`)
  const bridge = `\x3cscript>
    let logoState = null;
    function applyLogoState() {
      if (!logoState) return;
      const mark = document.querySelector('.side .brand-mark');
      const name = document.querySelector('.side .brand-name');
      const sub = document.querySelector('.side .brand-sub');
      if (mark) {
        mark.style.background = logoState.transparentMark ? 'transparent' : (logoState.brandColor ? '#ffffff' : '');
        const image = mark.querySelector('img');
        if (!image || image.getAttribute('src') !== logoState.logo) mark.innerHTML = '<img alt="" src="' + logoState.logo + '">';
        mark.dataset.shape = 'square';
      }
      if (name && name.textContent !== logoState.name) name.textContent = logoState.name;
      if (sub && sub.textContent !== logoState.sub) sub.textContent = logoState.sub;
      if (mark) mark.dataset.logoReady = 'true';
    }
    window.addEventListener('message', function(event) {
      const data = event.data;
      if (!data) return;
      if (data.type === 'navigate') { location.hash = data.screen; return; }
      if (data.type !== 'logo-mockup') return;
      logoState = data;
      applyLogoState();
    });
    const appRoot = document.getElementById('app');
    if (appRoot) new MutationObserver(applyLogoState).observe(appRoot, { childList: true, subtree: true });
  <\/script>`
  return source.replace('</body>', bridge + '</body>')
}

