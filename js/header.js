document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('.header');
  var burger = document.querySelector('.header__burger');
  var mobilePanel = document.querySelector('.header__mobile-panel');

  function atualizarHeader() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  atualizarHeader();
  window.addEventListener('scroll', atualizarHeader);

  burger.addEventListener('click', function () {
    var aberto = mobilePanel.classList.toggle('aberto');
    burger.classList.toggle('aberto', aberto);
    document.body.style.overflow = aberto ? 'hidden' : '';
  });

  mobilePanel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobilePanel.classList.remove('aberto');
      burger.classList.remove('aberto');
      document.body.style.overflow = '';
    });
  });
});
