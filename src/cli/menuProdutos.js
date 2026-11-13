const Produto = require('../models/Produto');
const Categoria = require('../models/Categoria');
const Vendedor = require('../models/Vendedor');
const executar = require('./executar');
const {
  exibirMenu,
  escolher,
  pausar,
  perguntar,
  perguntarNumero,
  perguntarOpcional,
  perguntarNumeroOpcional,
  confirmar,
  exibirTabela,
  soPreenchidos,
} = require('./entrada');

const colunas = ['rotulo', 'preco', 'estoque', 'categoria', 'vendedor'];
const colunasEscolha = ['rotulo', 'preco', 'estoque'];

async function comNomes(produtos) {
  const categorias = new Map((await Categoria.listarTodos()).map((c) => [String(c._id), c.nome]));
  const vendedores = new Map((await Vendedor.listarTodos()).map((v) => [String(v._id), v.nome]));
  return produtos.map((produto) => ({
    ...produto,
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
          const categoria = await escolher(Categoria, ['nome'], 'Categorias');
          const vendedor = await escolher(Vendedor, ['nome', 'email'], 'Vendedores');
          const rotulo = await perguntar('Rótulo: ');
          const preco = await perguntarNumero('Preço: ');
          const estoque = await perguntarNumero('Estoque: ');
          const descricao = await perguntar('Descrição (opcional): ');
          const id = await new Produto(rotulo, preco, estoque, categoria._id, vendedor._id, descricao).inserir();
          console.log(`\n✅ Produto cadastrado com id ${id}`);
        });
        break;
      case '2':
        await executar('Listar produtos', async () => {
          exibirTabela(await comNomes(await Produto.listarTodos()), colunas);
        });
        break;
      case '3':
        await executar('Consultar produto', async () => {
          const produto = await escolher(Produto, colunasEscolha, 'Produtos');
          exibirTabela(await comNomes([produto]), [...colunas, 'descricao'], { comId: true });
        });
        break;
      case '4':
        await executar('Atualizar produto', async () => {
          const produto = await escolher(Produto, colunasEscolha, 'Produtos');
          console.log('Deixe em branco para manter o valor atual.\n');
          const rotulo = await perguntarOpcional(`Rótulo [${produto.rotulo}]: `);
          const preco = await perguntarNumeroOpcional(`Preço [${produto.preco}]: `);
          const estoque = await perguntarNumeroOpcional(`Estoque [${produto.estoque}]: `);
          const descricao = await perguntarOpcional(`Descrição [${produto.descricao || 'vazio'}]: `);
          console.log('');
          const categoria = await escolher(Categoria, ['nome'], 'Nova categoria', { opcional: true });
          const vendedor = await escolher(Vendedor, ['nome', 'email'], 'Novo vendedor', { opcional: true });
          const dados = soPreenchidos({
            rotulo,
            preco,
            estoque,
            descricao,
            idCategoria: categoria?._id,
            idVendedor: vendedor?._id,
          });
          await Produto.atualizar(produto._id, dados);
          console.log('\n✅ Produto atualizado');
        });
        break;
      case '5':
        await executar('Excluir produto', async () => {
          const produto = await escolher(Produto, colunasEscolha, 'Produtos');
          if (await confirmar(`Confirma a exclusão de "${produto.rotulo}"?`)) {
            await Produto.excluir(produto._id);
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
          exibirTabela(await comNomes(await Produto.buscarPorRotulo(texto)), colunas);
        });
        break;
      case '7':
        await executar('Buscar produtos por categoria', async () => {
          const categoria = await escolher(Categoria, ['nome'], 'Categorias');
          exibirTabela(await comNomes(await Produto.buscarPorCategoria(categoria._id)), colunas);
        });
        break;
      case '8':
        await executar('Buscar produtos por vendedor', async () => {
          const vendedor = await escolher(Vendedor, ['nome', 'email'], 'Vendedores');
          exibirTabela(await comNomes(await Produto.buscarPorVendedor(vendedor._id)), colunas);
        });
        break;
      case '9':
        await executar('Buscar produtos por faixa de preço', async () => {
          const min = await perguntarNumero('Preço mínimo: ');
          const max = await perguntarNumero('Preço máximo: ');
          console.log('');
          exibirTabela(await comNomes(await Produto.buscarPorFaixaDePreco(min, max)), colunas);
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
