document.addEventListener('DOMContentLoaded', function () {
  var vitrines = document.querySelectorAll('.vitrine');

  vitrines.forEach(function (vitrine) {
    var viewport = vitrine.querySelector('.vitrine__viewport');
    var trilho = vitrine.querySelector('.vitrine__trilho');
    var slides = vitrine.querySelectorAll('.vitrine__slide');
    var total = slides.length;
    var btnPrev = vitrine.querySelector('.vitrine__seta--prev');
    var btnNext = vitrine.querySelector('.vitrine__seta--next');
    var indice = 0;

    function visiveis() {
      var w = window.innerWidth;
      if (w < 600) return 1;
      if (w < 1000) return 2;
      return 4;
    }

    function atualizar() {
      var v = visiveis();
      var larguraSlide = viewport.clientWidth / v;
      slides.forEach(function (slide) { slide.style.width = larguraSlide + 'px'; });

      var indiceMax = Math.max(0, total - v);
      if (indice > indiceMax) indice = indiceMax;

      trilho.style.transform = 'translateX(-' + (indice * larguraSlide) + 'px)';

      var semNavegacao = indiceMax === 0;
      btnPrev.style.display = semNavegacao ? 'none' : 'flex';
      btnNext.style.display = semNavegacao ? 'none' : 'flex';
      btnPrev.disabled = indice <= 0;
      btnNext.disabled = indice >= indiceMax;
    }

    btnPrev.addEventListener('click', function () {
      indice = Math.max(0, indice - 1);
      atualizar();
    });

    btnNext.addEventListener('click', function () {
      var indiceMax = Math.max(0, total - visiveis());
      indice = Math.min(indiceMax, indice + 1);
      atualizar();
    });

    window.addEventListener('resize', atualizar);
    atualizar();
  });
});