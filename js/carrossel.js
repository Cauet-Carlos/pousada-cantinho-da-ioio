document.addEventListener('DOMContentLoaded', function () {
  var carrosseis = document.querySelectorAll('.carrossel');

  carrosseis.forEach(function (carrossel) {
    var trilho = carrossel.querySelector('.carrossel__trilho');
    var slides = carrossel.querySelectorAll('.carrossel__slide');
    var total = slides.length;

    if (total <= 1) {
      carrossel.classList.add('carrossel--sem-controles');
      return;
    }

    var pontosWrap = carrossel.querySelector('.carrossel__pontos');
    var btnPrev = carrossel.querySelector('.carrossel__seta--prev');
    var btnNext = carrossel.querySelector('.carrossel__seta--next');
    var indice = 0;

    // Criação dos pontos (indicadores)
    for (var i = 0; i < total; i++) {
      var ponto = document.createElement('button');
      ponto.type = 'button';
      ponto.className = 'carrossel__ponto' + (i === 0 ? ' carrossel__ponto--ativo' : '');
      ponto.setAttribute('aria-label', 'Ir para foto ' + (i + 1));
      
      // Removido o reiniciarAutoplay daqui
      ponto.addEventListener('click', function (idx) {
        return function () {
          irPara(idx);
        };
      }(i));
      
      pontosWrap.appendChild(ponto);
    }

    var pontos = pontosWrap.querySelectorAll('.carrossel__ponto');

    function irPara(novoIndice) {
      indice = (novoIndice + total) % total;
      trilho.style.transform = 'translateX(-' + (indice * 100) + '%)';
      pontos.forEach(function (p, i) {
        p.classList.toggle('carrossel__ponto--ativo', i === indice);
      });
    }

    // Eventos dos botões de anterior e próximo (sem reiniciarAutoplay)
    btnPrev.addEventListener('click', function () {
      irPara(indice - 1);
    });

    btnNext.addEventListener('click', function () {
      irPara(indice + 1);
    });
  });
});
