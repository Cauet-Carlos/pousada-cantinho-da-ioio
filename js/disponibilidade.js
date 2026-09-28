// URL_PLANILHA: link da planilha Google publicada como CSV.
const URL_PLANILHA = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTz96vN8yIn0B-_yDRv5F3uTTLjrqYs3Z2M-j-GzvOBV7BaCnXZrmPzHQbT5Au7lrWwnC3_FoQ1ilo9/pub?gid=1767532748&single=true&output=csv';

// Lista canônica dos quartos reais da pousada.
const QUARTOS = [
  { nome: 'Bem-te-vi', tipo: 'triplo' },
  { nome: 'Beija-flor', tipo: 'triplo' },
  { nome: 'Tucano', tipo: 'triplo' },
  { nome: 'Japiim', tipo: 'quadruplo' }
];

let reservas = [];

async function carregarDisponibilidade() {
  if (!URL_PLANILHA) return;
  try {
    const resposta = await fetch(URL_PLANILHA);
    const textoCsv = await resposta.text();
    reservas = converterCsvParaReservas(textoCsv);
  } catch (erro) {
    console.error('Não foi possível carregar a disponibilidade:', erro);
    reservas = [];
  }
}

// CSV esperado: checkin,checkout,quarto,hospede — uma linha por quarto reservado.
function converterCsvParaReservas(csv) {
  const linhas = csv.trim().split('\n').slice(1);
  return linhas
    .filter(function (linha) { return linha.trim() !== ''; })
    .map(function (linha) {
      const colunas = linha.split(',');
      return {
        inicio: new Date(colunas[0] ? colunas[0].trim() : ''),
        fim: new Date(colunas[1] ? colunas[1].trim() : ''),
        quarto: colunas[2] ? colunas[2].trim() : ''
      };
    })
    .filter(function (r) {
      return !isNaN(r.inicio) && !isNaN(r.fim) && r.quarto !== '';
    });
}

function periodosSeSobrepoem(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && fimA > inicioB;
}

// Função pura: um quarto específico está ocupado num período?
function quartoOcupado(listaReservas, nomeQuarto, dataInicio, dataFim) {
  return listaReservas.some(function (r) {
    return r.quarto === nomeQuarto && periodosSeSobrepoem(dataInicio, dataFim, r.inicio, r.fim);
  });
}

// Devolve o status de TODOS os quartos reais pra um período — usada tanto
// pelo calendário (visão geral) quanto pelo formulário (lista por nome).
function verificarDisponibilidadeQuartos(dataInicio, dataFim) {
  return QUARTOS.map(function (q) {
    return {
      nome: q.nome,
      tipo: q.tipo,
      disponivel: !quartoOcupado(reservas, q.nome, dataInicio, dataFim)
    };
  });
}

// Usada pelo calendário: nesse dia, sobra ALGUM quarto livre?
function existeQuartoLivre(dataInicio, dataFim) {
  return verificarDisponibilidadeQuartos(dataInicio, dataFim).some(function (q) { return q.disponivel; });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', carregarDisponibilidade);
}

if (typeof module !== 'undefined') {
  module.exports = {
    converterCsvParaReservas, quartoOcupado, verificarDisponibilidadeQuartos,
    existeQuartoLivre, QUARTOS
  };
}
