// Define o banco de testes antes de carregar o projeto, para nunca tocar no banco real.
process.env.MONGODB_DB = 'ecommerce_teste';

const assert = require('node:assert/strict');
const { ObjectId } = require('mongodb');
const { conectar, desconectar } = require('./src/config/database');
const Categoria = require('./src/models/Categoria');
const Vendedor = require('./src/models/Vendedor');
const Produto = require('./src/models/Produto');
const CategoriaDAO = require('./src/dao/CategoriaDAO');
const VendedorDAO = require('./src/dao/VendedorDAO');
const ProdutoDAO = require('./src/dao/ProdutoDAO');
const ValidationError = require('./src/errors/ValidationError');
const NotFoundError = require('./src/errors/NotFoundError');
const ConflictError = require('./src/errors/ConflictError');

const categoriaDAO = new CategoriaDAO();
const vendedorDAO = new VendedorDAO();
const produtoDAO = new ProdutoDAO();

const testes = [];
function teste(descricao, fn) {
  testes.push([descricao, fn]);
}

async function contar(dao) {
  return (await dao.colecao()).countDocuments();
}

let idCategoria;
let idVendedor;
let idProduto;
let idMouse;
let idCategoria2;
let idVendedor2;
let idCabo;

teste('Categoria: inserir válida e buscar por id', async () => {
  idCategoria = await categoriaDAO.inserir(new Categoria('Eletrônicos', 'Aparelhos'));
  assert.ok(idCategoria instanceof ObjectId);
  const doc = await categoriaDAO.buscarPorId(idCategoria);
  assert.equal(doc.nome, 'Eletrônicos');
  assert.equal(doc.descricao, 'Aparelhos');
});

teste('buscarPorId devolve a entidade com campos privados', async () => {
  const categoria = await categoriaDAO.buscarPorId(idCategoria);
  assert.ok(categoria instanceof Categoria);
  assert.deepEqual(Object.keys(categoria), []);
  assert.deepEqual(categoria.id, idCategoria);
});

teste('Vendedor: inserir válido e buscar por id (id em texto)', async () => {
  idVendedor = await vendedorDAO.inserir(new Vendedor('Ana', 'ANA@loja.com'));
  const doc = await vendedorDAO.buscarPorId(String(idVendedor));
  assert.equal(doc.nome, 'Ana');
  assert.equal(doc.email, 'ana@loja.com');
});

teste('Produto: inserir válido e buscar por id', async () => {
  idProduto = await produtoDAO.inserir(new Produto('Fone', 199.9, 10, idCategoria, idVendedor, 'Bluetooth'));
  const doc = await produtoDAO.buscarPorId(idProduto);
  assert.equal(doc.rotulo, 'Fone');
  assert.equal(doc.preco, 199.9);
  assert.equal(doc.estoque, 10);
});

teste('Inserir inválido lança ValidationError e não grava nada', async () => {
  const antes = [await contar(categoriaDAO), await contar(vendedorDAO), await contar(produtoDAO)];
  await assert.rejects(categoriaDAO.inserir(new Categoria('   ')), ValidationError);
  await assert.rejects(vendedorDAO.inserir(new Vendedor('Bia', 'bia@loja')), ValidationError);
  await assert.rejects(produtoDAO.inserir(new Produto('', 10, 1, idCategoria, idVendedor)), ValidationError);
  const depois = [await contar(categoriaDAO), await contar(vendedorDAO), await contar(produtoDAO)];
  assert.deepEqual(depois, antes);
});

teste('listarTodos devolve a quantidade esperada, ordenada', async () => {
  await categoriaDAO.inserir(new Categoria('Casa'));
  await categoriaDAO.inserir(new Categoria('Brinquedos'));
  await categoriaDAO.inserir(new Categoria('áudio'));
  const lista = await categoriaDAO.listarTodos();
  assert.deepEqual(lista.map((c) => c.nome), ['áudio', 'Brinquedos', 'Casa', 'Eletrônicos']);
  assert.equal((await produtoDAO.listarTodos()).length, 1);
});

teste('buscarPorId inexistente lança NotFoundError', async () => {
  await assert.rejects(categoriaDAO.buscarPorId(new ObjectId()), NotFoundError);
  await assert.rejects(vendedorDAO.buscarPorId(new ObjectId()), NotFoundError);
  await assert.rejects(produtoDAO.buscarPorId(new ObjectId()), NotFoundError);
});

teste('buscarPorId com texto inválido lança ValidationError', async () => {
  await assert.rejects(categoriaDAO.buscarPorId('abc'), ValidationError);
  await assert.rejects(categoriaDAO.buscarPorId('abcdefghijkl'), ValidationError);
});

teste('atualizar muda só o campo informado e mantém os demais', async () => {
  const doc = await produtoDAO.atualizar(idProduto, { preco: 150 });
  assert.equal(doc.preco, 150);
  assert.equal(doc.rotulo, 'Fone');
  assert.equal(doc.estoque, 10);
  assert.equal(doc.descricao, 'Bluetooth');
});

teste('atualizar com dado inválido lança ValidationError e não altera', async () => {
  await assert.rejects(produtoDAO.atualizar(idProduto, { preco: -1 }), ValidationError);
  await assert.rejects(vendedorDAO.atualizar(idVendedor, { email: 'sem-arroba' }), ValidationError);
  assert.equal((await produtoDAO.buscarPorId(idProduto)).preco, 150);
  assert.equal((await vendedorDAO.buscarPorId(idVendedor)).email, 'ana@loja.com');
});

teste('atualizar não permite trocar o id', async () => {
  const outroId = new ObjectId();
  const doc = await categoriaDAO.atualizar(idCategoria, { _id: outroId, id: outroId, nome: 'Eletrônicos e TV' });
  assert.deepEqual(doc.id, idCategoria);
  assert.equal(doc.nome, 'Eletrônicos e TV');
  await assert.rejects(categoriaDAO.buscarPorId(outroId), NotFoundError);
});

teste('Categoria sem descrição: atualizar só o nome funciona', async () => {
  const id = await categoriaDAO.inserir(new Categoria('Livros'));
  assert.equal((await categoriaDAO.buscarPorId(id)).descricao, '');
  const doc = await categoriaDAO.atualizar(id, { nome: 'Livros e Revistas' });
  assert.equal(doc.nome, 'Livros e Revistas');
  assert.equal(doc.descricao, '');
});

teste('atualizar ignora campos undefined (mantém o valor atual)', async () => {
  const doc = await produtoDAO.atualizar(idProduto, { rotulo: undefined, estoque: 7 });
  assert.equal(doc.rotulo, 'Fone');
  assert.equal(doc.estoque, 7);
});

teste('converterErroDuplicidade usa o valor digitado, não a chave interna', () => {
  const erroMongo = { code: 11000, keyValue: { nome: '313f314f4b4543392d' } };
  const convertido = categoriaDAO.converterErroDuplicidade(erroMongo, { nome: 'eletrônicos' });
  assert.equal(convertido.name, 'ConflictError');
  assert.equal(convertido.campo, 'nome');
  assert.match(convertido.message, /"eletrônicos"/);
  const outro = new Error('outro');
  assert.equal(categoriaDAO.converterErroDuplicidade(outro, {}), outro);
});

teste('atualizar id inexistente lança NotFoundError', async () => {
  await assert.rejects(categoriaDAO.atualizar(new ObjectId(), { nome: 'X' }), NotFoundError);
});

teste('Produto com categoria/vendedor inexistente ou id inválido', async () => {
  const antes = await contar(produtoDAO);
  await assert.rejects(produtoDAO.inserir(new Produto('X', 10, 1, new ObjectId(), idVendedor)), NotFoundError);
  await assert.rejects(produtoDAO.inserir(new Produto('X', 10, 1, idCategoria, new ObjectId())), NotFoundError);
  await assert.rejects(produtoDAO.inserir(new Produto('X', 10, 1, 'abc', idVendedor)), ValidationError);
  await assert.rejects(produtoDAO.inserir(new Produto('X', 10, 1, idCategoria, 'abc')), ValidationError);
  assert.equal(await contar(produtoDAO), antes);
});

teste('Produto inserido com ids em texto é gravado como ObjectId', async () => {
  idMouse = await produtoDAO.inserir(new Produto('Mouse', 50, 3, String(idCategoria), String(idVendedor)));
  const doc = await produtoDAO.buscarPorId(idMouse);
  assert.ok(doc.idCategoria instanceof ObjectId);
  assert.ok(doc.idVendedor instanceof ObjectId);
});

teste('atualizar produto com categoria inexistente lança NotFoundError e não altera', async () => {
  await assert.rejects(produtoDAO.atualizar(idMouse, { idCategoria: new ObjectId() }), NotFoundError);
  const doc = await produtoDAO.buscarPorId(idMouse);
  assert.deepEqual(doc.idCategoria, idCategoria);
});

teste('Vendedor com email duplicado lança ConflictError (campo email)', async () => {
  await assert.rejects(vendedorDAO.inserir(new Vendedor('Outra Ana', 'ANA@loja.com ')), (erro) => {
    assert.ok(erro instanceof ConflictError);
    assert.equal(erro.campo, 'email');
    return true;
  });
});

teste('Categoria com nome repetido (outra caixa) lança ConflictError com o nome digitado', async () => {
  await assert.rejects(categoriaDAO.inserir(new Categoria('ELETRÔNICOS E TV')), (erro) => {
    assert.ok(erro instanceof ConflictError);
    assert.equal(erro.campo, 'nome');
    assert.match(erro.message, /"ELETRÔNICOS E TV"/);
    return true;
  });
});

teste('atualizar vendedor para o email de outro lança ConflictError', async () => {
  idVendedor2 = await vendedorDAO.inserir(new Vendedor('Bruno', 'bruno@loja.com'));
  await assert.rejects(vendedorDAO.atualizar(idVendedor, { email: 'bruno@loja.com' }), ConflictError);
  assert.equal((await vendedorDAO.buscarPorId(idVendedor)).email, 'ana@loja.com');
});

teste('buscas: prepara segunda categoria, vendedor e produto', async () => {
  idCategoria2 = await categoriaDAO.inserir(new Categoria('Informática'));
  idCabo = await produtoDAO.inserir(new Produto('Cabo C++', 20, 8, idCategoria2, idVendedor2));
});

teste('buscarPorRotulo: parcial sem diferenciar caixa e com caracteres especiais', async () => {
  assert.deepEqual((await produtoDAO.buscarPorRotulo('FON')).map((p) => p.rotulo), ['Fone']);
  assert.deepEqual((await produtoDAO.buscarPorRotulo('C++')).map((p) => p.rotulo), ['Cabo C++']);
  assert.deepEqual(await produtoDAO.buscarPorRotulo('xyz'), []);
  await assert.rejects(produtoDAO.buscarPorRotulo('   '), ValidationError);
});

teste('buscarPorFaixaDePreco: valida a faixa e devolve só os produtos dentro dela', async () => {
  await assert.rejects(produtoDAO.buscarPorFaixaDePreco(10, 5), ValidationError);
  await assert.rejects(produtoDAO.buscarPorFaixaDePreco(-1, 5), ValidationError);
  await assert.rejects(produtoDAO.buscarPorFaixaDePreco(NaN, 5), ValidationError);
  const dentro = await produtoDAO.buscarPorFaixaDePreco(40, 200);
  assert.deepEqual(dentro.map((p) => p.rotulo), ['Fone', 'Mouse']);
  assert.deepEqual((await produtoDAO.buscarPorFaixaDePreco(20, 20)).map((p) => p.rotulo), ['Cabo C++']);
});

teste('buscarPorCategoria e buscarPorVendedor devolvem só os produtos certos', async () => {
  assert.deepEqual((await produtoDAO.buscarPorCategoria(idCategoria)).map((p) => p.rotulo), ['Fone', 'Mouse']);
  assert.deepEqual((await produtoDAO.buscarPorCategoria(String(idCategoria2))).map((p) => p.rotulo), ['Cabo C++']);
  assert.deepEqual((await produtoDAO.buscarPorVendedor(idVendedor)).map((p) => p.rotulo), ['Fone', 'Mouse']);
  assert.deepEqual((await produtoDAO.buscarPorVendedor(idVendedor2)).map((p) => p.rotulo), ['Cabo C++']);
  await assert.rejects(produtoDAO.buscarPorCategoria(new ObjectId()), NotFoundError);
  await assert.rejects(produtoDAO.buscarPorVendedor('abc'), ValidationError);
});

teste('excluir categoria/vendedor com produtos lança ConflictError e mantém o registro', async () => {
  await assert.rejects(categoriaDAO.excluir(idCategoria), (erro) => {
    assert.ok(erro instanceof ConflictError);
    assert.match(erro.message, /2 produto\(s\)/);
    return true;
  });
  await assert.rejects(vendedorDAO.excluir(idVendedor), ConflictError);
  await assert.rejects(categoriaDAO.excluir(idCategoria2), ConflictError);
  await categoriaDAO.buscarPorId(idCategoria);
  await vendedorDAO.buscarPorId(idVendedor);
});

teste('excluir categoria/vendedor inexistente continua lançando NotFoundError (não Conflict)', async () => {
  await assert.rejects(categoriaDAO.excluir(new ObjectId()), NotFoundError);
  await assert.rejects(vendedorDAO.excluir(new ObjectId()), NotFoundError);
});

teste('depois de excluir os produtos, categoria e vendedor extras podem ser excluídos', async () => {
  await produtoDAO.excluir(idCabo);
  await produtoDAO.excluir(idMouse);
  assert.equal(await categoriaDAO.excluir(idCategoria2), true);
  assert.equal(await vendedorDAO.excluir(idVendedor2), true);
});

teste('excluir existente retorna true e depois não é mais encontrado', async () => {
  assert.equal(await produtoDAO.excluir(idProduto), true);
  await assert.rejects(produtoDAO.buscarPorId(idProduto), NotFoundError);
  assert.equal(await vendedorDAO.excluir(idVendedor), true);
  await assert.rejects(vendedorDAO.buscarPorId(idVendedor), NotFoundError);
  assert.equal(await categoriaDAO.excluir(idCategoria), true);
  await assert.rejects(categoriaDAO.buscarPorId(idCategoria), NotFoundError);
});

teste('excluir inexistente lança NotFoundError', async () => {
  await assert.rejects(categoriaDAO.excluir(new ObjectId()), NotFoundError);
  await assert.rejects(vendedorDAO.excluir(new ObjectId()), NotFoundError);
  await assert.rejects(produtoDAO.excluir(new ObjectId()), NotFoundError);
});

(async () => {
  let falhas = 0;
  let db;
  try {
    db = await conectar();
    await db.dropDatabase();
    await Promise.all([categoriaDAO.criarIndices(), vendedorDAO.criarIndices(), produtoDAO.criarIndices()]);

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
