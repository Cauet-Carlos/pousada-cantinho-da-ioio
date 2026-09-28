document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('form-reserva');
  if (!form) return;

  var numeroWhatsApp = '5597984578046'; // TEMPORÁRIO — número de teste, trocar antes de publicar
  var avisoEl = document.getElementById('aviso-conflito');
  var dicaEl = document.getElementById('dica-quartos');

  // Pré-preenche hóspedes vindo da Home (?hospedes=...)
  var paramsUrl = new URLSearchParams(window.location.search);
  var hospedesUrl = paramsUrl.get('hospedes');
  if (hospedesUrl) {
    var campoHospedes = document.getElementById('hospedes');
    if (campoHospedes) campoHospedes.value = hospedesUrl;
  }

  // Chamada pelo calendario.js sempre que check-in/check-out mudam.
  window.aoSelecionarDatas = function (dataInicio, dataFim) {
    if (typeof verificarDisponibilidadeQuartos !== 'function') return;
    var status = verificarDisponibilidadeQuartos(dataInicio, dataFim);
    var algumLivre = false;

    status.forEach(function (q) {
      var item = form.querySelector('.opcao-item[data-quarto="' + q.nome + '"]');
      if (!item) return;
      var input = item.querySelector('input');
      var badge = item.querySelector('.opcao-status');

      if (q.disponivel) {
        algumLivre = true;
        input.disabled = false;
        item.classList.remove('opcao-item--indisponivel');
        badge.textContent = '';
      } else {
        input.disabled = true;
        input.checked = false;
        item.classList.add('opcao-item--indisponivel');
        badge.textContent = 'Indisponível nessas datas';
      }
    });

    dicaEl.textContent = algumLivre
      ? 'Quartos riscados já estão reservados nessas datas.'
      : 'Nenhum quarto disponível para o período escolhido — tente outras datas.';
  };

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    avisoEl.classList.remove('mostrar');

    var calWrap = document.getElementById('calendario');
    var checkin = calWrap.dataset.checkin;
    var checkout = calWrap.dataset.checkout;

    if (!checkin || !checkout) {
      mostrarAviso('Selecione a data de chegada e de saída no calendário.');
      return;
    }

    var quartosMarcados = Array.prototype.slice.call(form.querySelectorAll('input[name="quarto"]:checked'));
    if (quartosMarcados.length === 0) {
      mostrarAviso('Selecione ao menos um quarto disponível.');
      return;
    }

    // Checagem final de segurança (o quarto já vem desabilitado se ocupado,
    // mas confere de novo caso os dados tenham sido carregados nesse meio-tempo).
    if (typeof quartoOcupado !== 'undefined' && typeof verificarDisponibilidadeQuartos === 'function') {
      var conflita = quartosMarcados.some(function (el) {
        return verificarDisponibilidadeQuartos(new Date(checkin), new Date(checkout))
          .find(function (q) { return q.nome === el.value; }).disponivel === false;
      });
      if (conflita) {
        mostrarAviso('Um dos quartos escolhidos ficou indisponível. Atualize a seleção antes de enviar.');
        return;
      }
    }

    var hospedes = document.getElementById('hospedes').value;
    var responsavel = document.getElementById('responsavel').value;
    var translado = form.querySelector('input[name="translado"]:checked').value;
    var quartosNomes = quartosMarcados.map(function (el) { return el.value; }).join(', ');
    var passeiosMarcados = Array.prototype.slice.call(form.querySelectorAll('input[name="passeio"]:checked')).map(function (el) { return el.value; });

    var msg = 'Olá! Gostaria de fazer uma solicitação de reserva.\n';
    msg += 'Responsável: ' + responsavel + '\n';
    msg += 'Check-in: ' + formatarData(checkin) + '\n';
    msg += 'Check-out: ' + formatarData(checkout) + '\n';
    msg += 'Quarto(s): ' + quartosNomes + '\n';
    msg += 'Hóspedes: ' + hospedes + '\n';
    msg += 'Translado: ' + translado + '\n';
    msg += 'Passeios: ' + (passeiosMarcados.length ? passeiosMarcados.join(', ') : 'Nenhum selecionado') + '\n';
    msg += 'Aguardo confirmação de disponibilidade, obrigado(a)!';

    window.open('https://wa.me/' + numeroWhatsApp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  function mostrarAviso(texto) {
    avisoEl.textContent = texto;
    avisoEl.classList.add('mostrar');
  }

  function formatarData(iso) {
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
});