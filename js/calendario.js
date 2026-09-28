document.addEventListener('DOMContentLoaded', function () {
  var wrap = document.getElementById('calendario');
  if (!wrap) return;

  var hoje = new Date(); hoje.setHours(0,0,0,0);
  var mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  var selecaoInicio = null, selecaoFim = null;

  // Pré-seleciona datas vindas da Home (?checkin=...&checkout=...)
  var paramsUrl = new URLSearchParams(window.location.search);
  var checkinUrl = paramsUrl.get('checkin');
  var checkoutUrl = paramsUrl.get('checkout');
  if (checkinUrl) {
    var di = new Date(checkinUrl + 'T00:00:00');
    if (!isNaN(di)) { selecaoInicio = di; mesAtual = new Date(di.getFullYear(), di.getMonth(), 1); }
  }
  if (checkoutUrl) {
    var dfim = new Date(checkoutUrl + 'T00:00:00');
    if (!isNaN(dfim)) selecaoFim = dfim;
  }

  var meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var diasSemana = ['D','S','T','Q','Q','S','S'];

  var titulo = document.getElementById('cal-titulo');
  var grade = document.getElementById('cal-grade');
  var display = document.getElementById('cal-display');
  var btnPrev = document.getElementById('cal-prev');
  var btnNext = document.getElementById('cal-next');

  function diaTotalmenteIndisponivel(data) {
    if (typeof existeQuartoLivre !== 'function') return false;
    var fim = new Date(data); fim.setDate(fim.getDate() + 1);
    return !existeQuartoLivre(data, fim);
  }

  function renderizar() {
    titulo.textContent = meses[mesAtual.getMonth()] + ' ' + mesAtual.getFullYear();
    grade.innerHTML = '';

    diasSemana.forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'cal-diasemana';
      el.textContent = d;
      grade.appendChild(el);
    });

    var primeiroDiaSemana = mesAtual.getDay();
    var totalDias = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();

    for (var i = 0; i < primeiroDiaSemana; i++) {
      grade.appendChild(document.createElement('div'));
    }

    for (var dia = 1; dia <= totalDias; dia++) {
      var data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-dia';
      btn.textContent = dia;

      var passado = data < hoje;
      var indisponivel = !passado && diaTotalmenteIndisponivel(data);

      if (passado || indisponivel) {
        btn.disabled = true;
        btn.className += indisponivel ? ' cal-dia--ocupado' : ' cal-dia--passado';
      } else {
        if (selecaoInicio && data.getTime() === selecaoInicio.getTime()) btn.className += ' cal-dia--selecionado';
        if (selecaoFim && data.getTime() === selecaoFim.getTime()) btn.className += ' cal-dia--selecionado';
        if (selecaoInicio && selecaoFim && data > selecaoInicio && data < selecaoFim) btn.className += ' cal-dia--intervalo';

        btn.addEventListener('click', function (dataClicada) {
          return function () {
            if (!selecaoInicio || (selecaoInicio && selecaoFim)) {
              selecaoInicio = dataClicada; selecaoFim = null;
            } else if (dataClicada > selecaoInicio) {
              selecaoFim = dataClicada;
            } else {
              selecaoInicio = dataClicada;
            }
            atualizarDisplay();
            renderizar();
          };
        }(data));
      }

      grade.appendChild(btn);
    }
  }

  function formatarData(d) {
    return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
  }

  function atualizarDisplay() {
    if (selecaoInicio && selecaoFim) {
      display.textContent = formatarData(selecaoInicio) + '  →  ' + formatarData(selecaoFim);
    } else if (selecaoInicio) {
      display.textContent = formatarData(selecaoInicio) + '  →  selecione a saída';
    } else {
      display.textContent = 'Selecione as datas';
    }
    wrap.dataset.checkin = selecaoInicio ? selecaoInicio.toISOString().slice(0,10) : '';
    wrap.dataset.checkout = selecaoFim ? selecaoFim.toISOString().slice(0,10) : '';

    // Adiado (setTimeout 0) para garantir que reserva.js já registrou
    // window.aoSelecionarDatas, mesmo quando isso roda na pré-seleção inicial.
    if (selecaoInicio && selecaoFim) {
      setTimeout(function () {
        if (typeof window.aoSelecionarDatas === 'function') {
          window.aoSelecionarDatas(selecaoInicio, selecaoFim);
        }
      }, 0);
    }
  }

  btnPrev.addEventListener('click', function () {
    mesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1);
    renderizar();
  });
  btnNext.addEventListener('click', function () {
    mesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1);
    renderizar();
  });

  atualizarDisplay();
  renderizar();
});