const readline = require('node:readline');
const { ObjectId } = require('mongodb');

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

async function perguntar(texto) {
  return (await lerLinha(texto)).trim();
}

async function perguntarNumero(texto) {
  const resposta = await perguntar(texto);
  if (resposta === '') return NaN;
  return Number(resposta.replace(',', '.'));
}

async function perguntarOpcional(texto) {
  const resposta = await perguntar(texto);
  return resposta === '' ? undefined : resposta;
}

async function perguntarNumeroOpcional(texto) {
  const resposta = await perguntar(texto);
  if (resposta === '') return undefined;
  return Number(resposta.replace(',', '.'));
}

async function confirmar(texto) {
  const resposta = await perguntar(`${texto} (s/N): `);
  return resposta.toLowerCase() === 's';
}

function exibirTabela(documentos, colunas) {
  if (documentos.length === 0) {
    console.log('Nenhum registro encontrado.');
    return;
  }
  const linhas = documentos.map((doc) => {
    const linha = {};
    for (const coluna of ['_id', ...colunas]) {
      const valor = doc[coluna];
      linha[coluna] = valor instanceof ObjectId ? String(valor) : valor;
    }
    return linha;
  });
  console.table(linhas);
}

function soPreenchidos(dados) {
  return Object.fromEntries(Object.entries(dados).filter(([, valor]) => valor !== undefined));
}

module.exports = {
  rl,
  EntradaEncerradaError,
  perguntar,
  perguntarNumero,
  perguntarOpcional,
  perguntarNumeroOpcional,
  confirmar,
  exibirTabela,
  soPreenchidos,
};
