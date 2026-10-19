// URL_PLANILHA: link da planilha Google publicada como CSV.
const URL_PLANILHA = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPutcmZkPet7zmbIPfSkrECj-cJbUrQ6_XvYTBK-Z1BVxeydhQF5pz3VqBQtb45RLDe9XBrXXBsIPA/pub?gid=1354800231&single=true&output=csv';

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
  // Avisa o calendário e o formulário que os dados chegaram
  document.dispatchEvent(new Event('disponibilidade:carregada'));
}

// Converte 'AAAA-MM-DD' em Date no horário LOCAL.
// (new Date('AAAA-MM-DD') seria lido como UTC e deslocaria o dia em Manaus.)
// Devolve uma data inválida (NaN) se o texto não estiver nesse formato.
function lerDataLocal(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((texto || '').trim());
  if (!m) return new Date(NaN);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

// CSV esperado: checkin,checkout,quarto,hospede — uma linha por quarto reservado.
// Compara nomes sem maiúsculas, acentos, hífen ou espaço: "Bemtevi" = "Bem-te-vi".
function normalizarNome(texto) {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Devolve o nome oficial do quarto (ex.: "Tucano") ou '' se não reconhecer.
function nomeOficialDoQuarto(texto) {
  const chave = normalizarNome(texto);
  const achado = QUARTOS.find(function (q) { return normalizarNome(q.nome) === chave; });
  return achado ? achado.nome : '';
}

// CSV esperado: checkin,checkout,quarto,hospede — uma linha por quarto reservado.
// Linhas inválidas são descartadas, com aviso no console (F12).
function converterCsvParaReservas(csv) {
  const linhas = csv.trim().split('\n').slice(1);
  const resultado = [];
  linhas.forEach(function (linha) {
    if (linha.replace(/,/g, '').trim() === '') return;
    const colunas = linha.split(',');
    const inicio = lerDataLocal(colunas[0]);
    const fim = lerDataLocal(colunas[1]);
    const quartoTexto = colunas[2] ? colunas[2].trim() : '';
    const quarto = nomeOficialDoQuarto(quartoTexto);

    let motivo = '';
    if (isNaN(inicio) || isNaN(fim)) motivo = 'data inválida (use AAAA-MM-DD)';
    else if (!quarto) motivo = 'quarto não reconhecido: "' + quartoTexto + '"';
    else if (fim <= inicio) motivo = 'saída não é depois da chegada';

    if (motivo) {
      // Cabeçalho e título não são reservas: não avisa por eles.
      if (String(colunas[0]).trim().toLowerCase() !== 'checkin') {
        console.warn('Linha ignorada (' + motivo + '): ' + linha.trim());
      }
      return;
    }
    resultado.push({ inicio: inicio, fim: fim, quarto: quarto });
  });
  return resultado;
}

// Regra da pousada: ninguém entra no mesmo dia em que outro hóspede sai.
// Por isso o dia da saída também conta como ocupado (<= e >=, não < e >).
function periodosSeSobrepoem(inicioA, fimA, inicioB, fimB) {
  return inicioA <= fimB && fimA >= inicioB;
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
    existeQuartoLivre, lerDataLocal, QUARTOS
  };
}