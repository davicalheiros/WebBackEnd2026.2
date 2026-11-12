// Deve vir ANTES de qualquer require do projeto: usa um banco separado do real
process.env.MONGODB_DB = 'ecommerce_teste';

const assert = require('node:assert/strict');
const { ObjectId } = require('mongodb');
const { conectar, desconectar } = require('./src/config/database');
const Categoria = require('./src/models/Categoria');
const Vendedor = require('./src/models/Vendedor');
const Produto = require('./src/models/Produto');
const ValidationError = require('./src/errors/ValidationError');
const NotFoundError = require('./src/errors/NotFoundError');

const testes = [];
function teste(descricao, fn) {
  testes.push([descricao, fn]);
}

async function contar(Entidade) {
  return (await Entidade.colecao()).countDocuments();
}

// Estado compartilhado entre os testes (rodam em sequência)
let idCategoria;
let idVendedor;
let idProduto;

// ---------- Inserir e buscar ----------
teste('Categoria: inserir válida e buscar por id', async () => {
  idCategoria = await new Categoria('Eletrônicos', 'Aparelhos').inserir();
  assert.ok(idCategoria instanceof ObjectId);
  const doc = await Categoria.buscarPorId(idCategoria);
  assert.equal(doc.nome, 'Eletrônicos');
  assert.equal(doc.descricao, 'Aparelhos');
});

teste('Vendedor: inserir válido e buscar por id (id em texto)', async () => {
  idVendedor = await new Vendedor('Ana', 'ANA@loja.com').inserir();
  const doc = await Vendedor.buscarPorId(String(idVendedor));
  assert.equal(doc.nome, 'Ana');
  assert.equal(doc.email, 'ana@loja.com');
});

teste('Produto: inserir válido e buscar por id', async () => {
  idProduto = await new Produto('Fone', 199.9, 10, idCategoria, idVendedor, 'Bluetooth').inserir();
  const doc = await Produto.buscarPorId(idProduto);
  assert.equal(doc.rotulo, 'Fone');
  assert.equal(doc.preco, 199.9);
  assert.equal(doc.estoque, 10);
});

teste('Inserir inválido lança ValidationError e não grava nada', async () => {
  const antes = [await contar(Categoria), await contar(Vendedor), await contar(Produto)];
  await assert.rejects(new Categoria('   ').inserir(), ValidationError);
  await assert.rejects(new Vendedor('Bia', 'bia@loja').inserir(), ValidationError);
  await assert.rejects(new Produto('', 10, 1, idCategoria, idVendedor).inserir(), ValidationError);
  const depois = [await contar(Categoria), await contar(Vendedor), await contar(Produto)];
  assert.deepEqual(depois, antes);
});

// ---------- Listar ----------
teste('listarTodos devolve a quantidade esperada, ordenada', async () => {
  await new Categoria('Casa').inserir();
  await new Categoria('Brinquedos').inserir();
  await new Categoria('áudio').inserir();
  const lista = await Categoria.listarTodos();
  // Ordem alfabética real: minúscula e acento não vão para o fim
  assert.deepEqual(lista.map((c) => c.nome), ['áudio', 'Brinquedos', 'Casa', 'Eletrônicos']);
  assert.equal((await Produto.listarTodos()).length, 1);
});

// ---------- Buscar por id: erros ----------
teste('buscarPorId inexistente lança NotFoundError', async () => {
  await assert.rejects(Categoria.buscarPorId(new ObjectId()), NotFoundError);
  await assert.rejects(Vendedor.buscarPorId(new ObjectId()), NotFoundError);
  await assert.rejects(Produto.buscarPorId(new ObjectId()), NotFoundError);
});

teste('buscarPorId com texto inválido lança ValidationError', async () => {
  await assert.rejects(Categoria.buscarPorId('abc'), ValidationError);
  // 12 caracteres: ObjectId.isValid aceitaria, nosso formato não
  await assert.rejects(Categoria.buscarPorId('abcdefghijkl'), ValidationError);
});

// ---------- Atualizar ----------
teste('atualizar muda só o campo informado e mantém os demais', async () => {
  const doc = await Produto.atualizar(idProduto, { preco: 150 });
  assert.equal(doc.preco, 150);
  assert.equal(doc.rotulo, 'Fone');
  assert.equal(doc.estoque, 10);
  assert.equal(doc.descricao, 'Bluetooth');
});

teste('atualizar com dado inválido lança ValidationError e não altera', async () => {
  await assert.rejects(Produto.atualizar(idProduto, { preco: -1 }), ValidationError);
  await assert.rejects(Vendedor.atualizar(idVendedor, { email: 'sem-arroba' }), ValidationError);
  assert.equal((await Produto.buscarPorId(idProduto)).preco, 150);
  assert.equal((await Vendedor.buscarPorId(idVendedor)).email, 'ana@loja.com');
});

teste('atualizar não permite trocar o _id', async () => {
  const outroId = new ObjectId();
  const doc = await Categoria.atualizar(idCategoria, { _id: outroId, nome: 'Eletrônicos e TV' });
  assert.deepEqual(doc._id, idCategoria);
  assert.equal(doc.nome, 'Eletrônicos e TV');
  await assert.rejects(Categoria.buscarPorId(outroId), NotFoundError);
});

teste('Categoria sem descrição: atualizar só o nome funciona', async () => {
  const id = await new Categoria('Livros').inserir();
  assert.equal((await Categoria.buscarPorId(id)).descricao, '');
  const doc = await Categoria.atualizar(id, { nome: 'Livros e Revistas' });
  assert.equal(doc.nome, 'Livros e Revistas');
  assert.equal(doc.descricao, '');
});

teste('atualizar ignora campos undefined (mantém o valor atual)', async () => {
  const doc = await Produto.atualizar(idProduto, { rotulo: undefined, estoque: 7 });
  assert.equal(doc.rotulo, 'Fone');
  assert.equal(doc.estoque, 7);
});

teste('converterErroDuplicidade usa o valor digitado, não a chave interna', () => {
  const erroMongo = { code: 11000, keyValue: { nome: '313f314f4b4543392d' } };
  const convertido = Categoria.converterErroDuplicidade(erroMongo, { nome: 'eletrônicos' });
  assert.equal(convertido.name, 'ConflictError');
  assert.equal(convertido.campo, 'nome');
  assert.match(convertido.message, /"eletrônicos"/);
  const outro = new Error('outro');
  assert.equal(Categoria.converterErroDuplicidade(outro, {}), outro);
});

teste('atualizar id inexistente lança NotFoundError', async () => {
  await assert.rejects(Categoria.atualizar(new ObjectId(), { nome: 'X' }), NotFoundError);
});

// ---------- Excluir ----------
teste('excluir existente retorna true e depois não é mais encontrado', async () => {
  assert.equal(await Produto.excluir(idProduto), true);
  await assert.rejects(Produto.buscarPorId(idProduto), NotFoundError);
  assert.equal(await Vendedor.excluir(idVendedor), true);
  await assert.rejects(Vendedor.buscarPorId(idVendedor), NotFoundError);
  assert.equal(await Categoria.excluir(idCategoria), true);
  await assert.rejects(Categoria.buscarPorId(idCategoria), NotFoundError);
});

teste('excluir inexistente lança NotFoundError', async () => {
  await assert.rejects(Categoria.excluir(new ObjectId()), NotFoundError);
  await assert.rejects(Vendedor.excluir(new ObjectId()), NotFoundError);
  await assert.rejects(Produto.excluir(new ObjectId()), NotFoundError);
});

(async () => {
  let falhas = 0;
  let db;
  try {
    db = await conectar();
    await db.dropDatabase(); // começa limpo

    for (const [descricao, fn] of testes) {
      try {
        await fn();
        console.log(`✅ ${descricao}`);
      } catch (erro) {
        falhas++;
        console.log(`❌ ${descricao}: ${erro.message}`);
      }
    }

    console.log(`\n${testes.length - falhas}/${testes.length} passaram`);
  } catch (erro) {
    falhas++;
    console.log(`❌ Falha ao preparar o teste: ${erro.message}`);
  } finally {
    if (db) await db.dropDatabase();
    await desconectar();
    process.exitCode = falhas ? 1 : 0;
  }
})();
