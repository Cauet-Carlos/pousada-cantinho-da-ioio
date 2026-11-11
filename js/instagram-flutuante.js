(function () {
  var USUARIO = 'pousadacantinhodaioio';
  var link = document.createElement('a');
  link.className = 'instagram-flutuante';
  link.href = 'https://www.instagram.com/' + USUARIO + '/';
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', 'Ver o Instagram da pousada');
  link.innerHTML =
    '<img src="assets/icone/instagram.png" alt="" width="26" height="26">' +
    '<span class="instagram-flutuante__rotulo">Siga no Instagram</span>';
  document.body.appendChild(link);
})();