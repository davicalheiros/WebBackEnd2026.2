const Produto = require('../models/Produto');
const Categoria = require('../models/Categoria');
const Vendedor = require('../models/Vendedor');
const executar = require('./executar');
const {
  perguntar,
  perguntarNumero,
  perguntarOpcional,
  perguntarNumeroOpcional,
  confirmar,
  exibirTabela,
  soPreenchidos,
} = require('./entrada');

const colunas = ['rotulo', 'preco', 'estoque', 'idCategoria', 'idVendedor'];

// Mostra categorias e vendedores para o usuário copiar os ids
async function listarReferencias() {
  console.log('\nCategorias disponíveis:');
  exibirTabela(await Categoria.listarTodos(), ['nome']);
  console.log('\nVendedores disponíveis:');
  exibirTabela(await Vendedor.listarTodos(), ['nome', 'email']);
  console.log('');
}

async function menuProdutos() {
  while (true) {
    console.log('\n=== PRODUTOS ===');
    console.log('1. Cadastrar   2. Listar   3. Buscar por id   4. Atualizar   5. Excluir');
    console.log('6. Buscar por rótulo   7. Por categoria   8. Por vendedor   9. Por faixa de preço   0. Voltar');
    const opcao = await perguntar('Opção: ');

    switch (opcao) {
      case '1':
        await executar('Inserir produto', async () => {
          await listarReferencias();
          const rotulo = await perguntar('Rótulo: ');
          const preco = await perguntarNumero('Preço: ');
          const estoque = await perguntarNumero('Estoque: ');
          const descricao = await perguntar('Descrição (opcional): ');
          const idCategoria = await perguntar('Id da categoria: ');
          const idVendedor = await perguntar('Id do vendedor: ');
          const id = await new Produto(rotulo, preco, estoque, idCategoria, idVendedor, descricao).inserir();
          console.log(`\n✅ Produto cadastrado com id ${id}`);
        });
        break;
      case '2':
        await executar('Listar produtos', async () => {
          exibirTabela(await Produto.listarTodos(), colunas);
        });
        break;
      case '3':
        await executar('Buscar produto por id', async () => {
          const id = await perguntar('Id: ');
          exibirTabela([await Produto.buscarPorId(id)], colunas);
        });
        break;
      case '4':
        await executar('Atualizar produto', async () => {
          const id = await perguntar('Id: ');
          exibirTabela([await Produto.buscarPorId(id)], colunas);
          await listarReferencias();
          console.log('Deixe em branco para manter o valor atual.');
          const dados = soPreenchidos({
            rotulo: await perguntarOpcional('Novo rótulo: '),
            preco: await perguntarNumeroOpcional('Novo preço: '),
            estoque: await perguntarNumeroOpcional('Novo estoque: '),
            descricao: await perguntarOpcional('Nova descrição: '),
            idCategoria: await perguntarOpcional('Novo id da categoria: '),
            idVendedor: await perguntarOpcional('Novo id do vendedor: '),
          });
          await Produto.atualizar(id, dados);
          console.log('\n✅ Produto atualizado');
        });
        break;
      case '5':
        await executar('Excluir produto', async () => {
          const id = await perguntar('Id: ');
          if (await confirmar('Confirma a exclusão?')) {
            await Produto.excluir(id);
            console.log('\n✅ Produto excluído');
          } else {
            console.log('Exclusão cancelada.');
          }
        });
        break;
      case '6':
        await executar('Buscar produtos por rótulo', async () => {
          const texto = await perguntar('Texto do rótulo: ');
          exibirTabela(await Produto.buscarPorRotulo(texto), colunas);
        });
        break;
      case '7':
        await executar('Buscar produtos por categoria', async () => {
          exibirTabela(await Categoria.listarTodos(), ['nome']);
          const id = await perguntar('Id da categoria: ');
          exibirTabela(await Produto.buscarPorCategoria(id), colunas);
        });
        break;
      case '8':
        await executar('Buscar produtos por vendedor', async () => {
          exibirTabela(await Vendedor.listarTodos(), ['nome', 'email']);
          const id = await perguntar('Id do vendedor: ');
          exibirTabela(await Produto.buscarPorVendedor(id), colunas);
        });
        break;
      case '9':
        await executar('Buscar produtos por faixa de preço', async () => {
          const min = await perguntarNumero('Preço mínimo: ');
          const max = await perguntarNumero('Preço máximo: ');
          exibirTabela(await Produto.buscarPorFaixaDePreco(min, max), colunas);
        });
        break;
      case '0':
        return;
      default:
        console.log('Opção inválida.');
    }
  }
}

module.exports = menuProdutos;
