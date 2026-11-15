const readline = require('node:readline');
const EntradaEncerradaError = require('../errors/EntradaEncerradaError');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// As linhas ficam numa fila porque o rl.question perde linhas quando vêm de um pipe ou de texto colado.
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

// Limpar a tela e pausar só fazem sentido em terminal de verdade (não com pipe).
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

// Aceita vírgula ou ponto como separador decimal: "19,90" ou "19.90".
function paraNumero(resposta) {
  return Number(resposta.replace(',', '.'));
}

// Vazio vira NaN, e não 0, para não ser aceito como número válido.
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

module.exports = {
  rl,
  limparTela,
  pausar,
  perguntar,
  perguntarNumero,
  perguntarOpcional,
  perguntarNumeroOpcional,
  confirmar,
};
