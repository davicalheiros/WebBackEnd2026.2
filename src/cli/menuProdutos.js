const Produto = require('../models/Produto');
const CategoriaDAO = require('../dao/CategoriaDAO');
const VendedorDAO = require('../dao/VendedorDAO');
const ProdutoDAO = require('../dao/ProdutoDAO');
const executar = require('./executar');
const {
  exibirMenu,
  escolher,
  formatarPreco,
  pausar,
  perguntar,
  perguntarNumero,
  perguntarOpcional,
  perguntarNumeroOpcional,
  confirmar,
  exibirTabela,
  soPreenchidos,
} = require('./entrada');

const categoriaDAO = new CategoriaDAO();
const vendedorDAO = new VendedorDAO();
const produtoDAO = new ProdutoDAO();

const colunas = ['rotulo', 'preco', 'estoque', 'categoria', 'vendedor'];
const colunasEscolha = ['rotulo', 'preco', 'estoque'];

async function comNomes(produtos) {
  const categorias = new Map((await categoriaDAO.listarTodos()).map((c) => [String(c.id), c.nome]));
  const vendedores = new Map((await vendedorDAO.listarTodos()).map((v) => [String(v.id), v.nome]));
  return produtos.map((produto) => ({
    id: produto.id,
    rotulo: produto.rotulo,
    preco: produto.preco,
    estoque: produto.estoque,
    descricao: produto.descricao,
    categoria: categorias.get(String(produto.idCategoria)),
    vendedor: vendedores.get(String(produto.idVendedor)),
  }));
}

async function menuProdutos() {
  while (true) {
    exibirMenu('PRODUTOS', [
      ['1', 'Cadastrar'],
      ['2', 'Listar'],
      ['3', 'Consultar'],
      ['4', 'Atualizar'],
      ['5', 'Excluir'],
      ['6', 'Buscar por rótulo'],
      ['7', 'Buscar por categoria'],
      ['8', 'Buscar por vendedor'],
      ['9', 'Buscar por faixa de preço'],
      ['0', 'Voltar'],
    ]);
    const opcao = await perguntar('Opção: ');

    switch (opcao) {
      case '1':
        await executar('Inserir produto', async () => {
          const categoria = await escolher(categoriaDAO, ['nome'], 'Categorias');
          const vendedor = await escolher(vendedorDAO, ['nome', 'email'], 'Vendedores');
          const rotulo = await perguntar('Rótulo: ');
          const preco = await perguntarNumero('Preço (R$): ');
          const estoque = await perguntarNumero('Estoque: ');
          const descricao = await perguntar('Descrição (opcional): ');
          const id = await produtoDAO.inserir(new Produto(rotulo, preco, estoque, categoria.id, vendedor.id, descricao));
          console.log(`\n✅ Produto cadastrado com id ${id}`);
        });
        break;
      case '2':
        await executar('Listar produtos', async () => {
          exibirTabela(await comNomes(await produtoDAO.listarTodos()), colunas);
        });
        break;
      case '3':
        await executar('Consultar produto', async () => {
          const produto = await escolher(produtoDAO, colunasEscolha, 'Produtos');
          exibirTabela(await comNomes([produto]), [...colunas, 'descricao'], { comId: true });
        });
        break;
      case '4':
        await executar('Atualizar produto', async () => {
          const produto = await escolher(produtoDAO, colunasEscolha, 'Produtos');
          console.log('Deixe em branco para manter o valor atual.\n');
          const rotulo = await perguntarOpcional(`Rótulo [${produto.rotulo}]: `);
          const preco = await perguntarNumeroOpcional(`Preço [${formatarPreco(produto.preco)}]: `);
          const estoque = await perguntarNumeroOpcional(`Estoque [${produto.estoque}]: `);
          const descricao = await perguntarOpcional(`Descrição [${produto.descricao || 'vazio'}]: `);
          console.log('');
          const categoria = await escolher(categoriaDAO, ['nome'], 'Nova categoria', { opcional: true });
          const vendedor = await escolher(vendedorDAO, ['nome', 'email'], 'Novo vendedor', { opcional: true });
          const dados = soPreenchidos({
            rotulo,
            preco,
            estoque,
            descricao,
            idCategoria: categoria?.id,
            idVendedor: vendedor?.id,
          });
          await produtoDAO.atualizar(produto.id, dados);
          console.log('\n✅ Produto atualizado');
        });
        break;
      case '5':
        await executar('Excluir produto', async () => {
          const produto = await escolher(produtoDAO, colunasEscolha, 'Produtos');
          if (await confirmar(`Confirma a exclusão de "${produto.rotulo}"?`)) {
            await produtoDAO.excluir(produto.id);
            console.log('\n✅ Produto excluído');
          } else {
            console.log('\nExclusão cancelada.');
          }
        });
        break;
      case '6':
        await executar('Buscar produtos por rótulo', async () => {
          const texto = await perguntar('Texto do rótulo: ');
          console.log('');
          exibirTabela(await comNomes(await produtoDAO.buscarPorRotulo(texto)), colunas);
        });
        break;
      case '7':
        await executar('Buscar produtos por categoria', async () => {
          const categoria = await escolher(categoriaDAO, ['nome'], 'Categorias');
          exibirTabela(await comNomes(await produtoDAO.buscarPorCategoria(categoria.id)), colunas);
        });
        break;
      case '8':
        await executar('Buscar produtos por vendedor', async () => {
          const vendedor = await escolher(vendedorDAO, ['nome', 'email'], 'Vendedores');
          exibirTabela(await comNomes(await produtoDAO.buscarPorVendedor(vendedor.id)), colunas);
        });
        break;
      case '9':
        await executar('Buscar produtos por faixa de preço', async () => {
          const min = await perguntarNumero('Preço mínimo (R$): ');
          const max = await perguntarNumero('Preço máximo (R$): ');
          console.log('');
          exibirTabela(await comNomes(await produtoDAO.buscarPorFaixaDePreco(min, max)), colunas);
        });
        break;
      case '0':
        return;
      default:
        console.log('\nOpção inválida.');
        await pausar();
    }
  }
}

module.exports = menuProdutos;
