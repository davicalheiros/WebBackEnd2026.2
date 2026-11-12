const Produto = require('./src/models/Produto');
const Categoria = require('./src/models/Categoria');
const Vendedor = require('./src/models/Vendedor');
const Logger = require('./src/utils/Logger');

const testes = [
  ['Produto valido',            () => new Produto('Fone', 199.9, 10, 'idCat', 'idVend').validar()],
  ['Produto sem rotulo',        () => new Produto('', 10, 5, 'idCat', 'idVend').validar()],
  ['Produto com preco negativo',() => new Produto('Fone', -5, 5, 'idCat', 'idVend').validar()],
  ['Produto com estoque 2.5',   () => new Produto('Fone', 10, 2.5, 'idCat', 'idVend').validar()],
  ['Produto sem idCategoria',   () => new Produto('Fone', 10, 5, null, 'idVend').validar()],

  ['Categoria valida',          () => new Categoria('Eletronicos').validar()],
  ['Categoria so com espacos',  () => new Categoria('   ').validar()],
  ['Categoria com nome numero', () => new Categoria(123).validar()],

  ['Vendedor valido',           () => new Vendedor('Ana', 'ana@loja.com').validar()],
  ['Vendedor email sem dominio',() => new Vendedor('Ana', 'ana@loja').validar()],
  ['Vendedor email vazio',      () => new Vendedor('Ana', '').validar()],
  ['Vendedor sem nome',         () => new Vendedor('', 'ana@loja.com').validar()],
];

for (const [descricao, acao] of testes) {
  try {
    acao();
    console.log(`✅ ${descricao}`);
  } catch (erro) {
    console.log(`❌ ${descricao}: ${erro.message}`);
    Logger.erro(erro, descricao);
  }
}