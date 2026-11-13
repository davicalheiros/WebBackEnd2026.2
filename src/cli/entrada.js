const readline = require('node:readline');
const { ObjectId } = require('mongodb');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');

class EntradaEncerradaError extends Error {
  constructor() {
    super('Entrada encerrada');
    this.name = 'EntradaEncerradaError';
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const fila = [];
let aguardando = null;
let encerrada = false;

rl.on('line', (linha) => {
  if (aguardando) {
    const { resolve } = aguardando;
    aguardando = null;
    resolve(linha);
  } else {
    fila.push(linha);
  }
});

rl.on('close', () => {
  encerrada = true;
  if (aguardando) {
    const { reject } = aguardando;
    aguardando = null;
    reject(new EntradaEncerradaError());
  }
});

function lerLinha(texto) {
  if (fila.length > 0) {
    return Promise.resolve(fila.shift());
  }
  if (encerrada) {
    return Promise.reject(new EntradaEncerradaError());
  }
  rl.setPrompt(texto);
  rl.prompt();
  return new Promise((resolve, reject) => {
    aguardando = { resolve, reject };
  });
}

const interativo = Boolean(process.stdin.isTTY && process.stdout.isTTY);

function limparTela() {
  if (interativo) console.clear();
}

async function pausar() {
  if (interativo) await lerLinha('\nPressione Enter para continuar...');
}

async function perguntar(texto) {
  return (await lerLinha(texto)).trim();
}

function paraNumero(resposta) {
  let texto = resposta.replace(/^R\$\s*/i, '').trim();
  if (texto.includes(',')) {
    texto = texto.replace(/\./g, '').replace(',', '.');
  }
  return Number(texto);
}

function formatarPreco(valor) {
  if (!Number.isFinite(valor)) return valor;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/g, ' ');
}

async function perguntarNumero(texto) {
  const resposta = await perguntar(texto);
  if (resposta === '') return NaN;
  return paraNumero(resposta);
}

async function perguntarOpcional(texto) {
  const resposta = await perguntar(texto);
  return resposta === '' ? undefined : resposta;
}

async function perguntarNumeroOpcional(texto) {
  const resposta = await perguntar(texto);
  if (resposta === '') return undefined;
  return paraNumero(resposta);
}

async function confirmar(texto) {
  const resposta = await perguntar(`${texto} (s/N): `);
  return resposta.toLowerCase() === 's';
}

function exibirTabela(documentos, colunas, { comId = false } = {}) {
  if (documentos.length === 0) {
    console.log('Nenhum registro encontrado.');
    return;
  }
  exibirNumerada(documentos, comId ? ['_id', ...colunas] : colunas);
}

function exibirMenu(titulo, opcoes) {
  limparTela();
  console.log(`\n=== ${titulo} ===\n`);
  for (const [tecla, texto] of opcoes) {
    if (tecla === '0') console.log('');
    console.log(`  ${tecla}. ${texto}`);
  }
  console.log('');
}

function exibirNumerada(documentos, colunas) {
  const linhas = {};
  documentos.forEach((doc, indice) => {
    const linha = {};
    for (const coluna of colunas) {
      const valor = doc[coluna];
      if (valor instanceof ObjectId) {
        linha[coluna] = String(valor);
      } else if (coluna === 'preco') {
        linha[coluna] = formatarPreco(valor);
      } else {
        linha[coluna] = valor;
      }
    }
    linhas[indice + 1] = linha;
  });
  console.table(linhas);
}

async function escolher(Entidade, colunas, titulo, { opcional = false } = {}) {
  const documentos = await Entidade.listarTodos();
  if (documentos.length === 0) {
    if (opcional) return undefined;
    throw new NotFoundError(`Nenhum(a) ${Entidade.nomeEntidade} cadastrado(a)`, Entidade.nomeEntidade);
  }

  console.log(`${titulo}:`);
  exibirNumerada(documentos, colunas);

  const dica = opcional ? 'Enter para manter' : 'ou cole o id';
  const resposta = await perguntar(`Escolha pelo número (${dica}): `);

  if (resposta === '') {
    if (opcional) {
      console.log('');
      return undefined;
    }
    throw new ValidationError(`Escolha um item da lista de ${titulo.toLowerCase()}`, 'id');
  }
  if (/^\d{1,6}$/.test(resposta)) {
    const numero = Number(resposta);
    if (numero < 1 || numero > documentos.length) {
      throw new ValidationError(`Número fora da lista (escolha de 1 a ${documentos.length})`, 'id');
    }
    console.log('');
    return documentos[numero - 1];
  }
  const documento = await Entidade.buscarPorId(resposta);
  console.log('');
  return documento;
}

function soPreenchidos(dados) {
  return Object.fromEntries(Object.entries(dados).filter(([, valor]) => valor !== undefined));
}

module.exports = {
  rl,
  EntradaEncerradaError,
  limparTela,
  pausar,
  exibirMenu,
  formatarPreco,
  escolher,
  perguntar,
  perguntarNumero,
  perguntarOpcional,
  perguntarNumeroOpcional,
  confirmar,
  exibirTabela,
  soPreenchidos,
};
