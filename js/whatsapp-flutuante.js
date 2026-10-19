(function () {
  var NUMERO_WHATSAPP = '5597984578046'; // TEMPORÁRIO — número de teste, trocar para 5592981310470 antes de publicar
  var MENSAGEM = 'Olá! Vim pelo site da Pousada Cantinho da Ioiô e gostaria de mais informações.';

  var link = document.createElement('a');
  link.className = 'whatsapp-flutuante';
  link.href = 'https://wa.me/' + NUMERO_WHATSAPP + '?text=' + encodeURIComponent(MENSAGEM);
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', 'Falar com a pousada pelo WhatsApp');
  link.innerHTML =
    '<span class="whatsapp-flutuante__rotulo">Fale com a gente</span>' +
    '<img src="assets/icone/whatsapp.png" alt="" width="24" height="24">';
  document.body.appendChild(link);
})();