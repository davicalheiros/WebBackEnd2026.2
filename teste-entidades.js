const Produto = require('./src/models/Produto');
const Categoria = require('./src/models/Categoria');
const Vendedor = require('./src/models/Vendedor');
const ValidationError = require('./src/errors/ValidationError');
const Logger = require('./src/utils/Logger');

const VALIDO = true;
const INVALIDO = false;

const testes = [
  ['Produto valido',             VALIDO,   () => new Produto('Fone', 199.9, 10, 'idCat', 'idVend').validar()],
  ['Produto sem rotulo',         INVALIDO, () => new Produto('', 10, 5, 'idCat', 'idVend').validar()],
  ['Produto com preco negativo', INVALIDO, () => new Produto('Fone', -5, 5, 'idCat', 'idVend').validar()],
  ['Produto com estoque 2.5',    INVALIDO, () => new Produto('Fone', 10, 2.5, 'idCat', 'idVend').validar()],
  ['Produto sem idCategoria',    INVALIDO, () => new Produto('Fone', 10, 5, null, 'idVend').validar()],

  ['Categoria valida',           VALIDO,   () => new Categoria('Eletronicos').validar()],
  ['Categoria so com espacos',   INVALIDO, () => new Categoria('   ').validar()],
  ['Categoria com nome numero',  INVALIDO, () => new Categoria(123).validar()],

  ['Vendedor valido',            VALIDO,   () => new Vendedor('Ana', 'ana@loja.com').validar()],
  ['Vendedor email sem dominio', INVALIDO, () => new Vendedor('Ana', 'ana@loja').validar()],
  ['Vendedor email vazio',       INVALIDO, () => new Vendedor('Ana', '').validar()],
  ['Vendedor sem nome',          INVALIDO, () => new Vendedor('', 'ana@loja.com').validar()],
];

let falhas = 0;

for (const [descricao, esperado, acao] of testes) {
  let erro = null;
  try {
    acao();
  } catch (e) {
    erro = e;
    Logger.erro(e, descricao);
  }

  const passou = esperado === VALIDO ? erro === null : erro instanceof ValidationError;
  if (!passou) falhas++;

  const resultado = erro ? `rejeitado: ${erro.message}` : 'aceito';
  console.log(`${passou ? '✅' : '❌'} ${descricao} (${resultado})`);
}

console.log(`\n${testes.length - falhas}/${testes.length} passaram`);
process.exitCode = falhas ? 1 : 0;
