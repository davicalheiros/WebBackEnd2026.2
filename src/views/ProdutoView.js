const BaseView = require('./BaseView');
const { perguntar, perguntarNumero, perguntarOpcional, perguntarNumeroOpcional, confirmar } = require('./terminal');

// View de produtos: menu, formulários, buscas e mensagens, sem acessar o banco.
class ProdutoView extends BaseView {
  constructor() {
    super();
    this.colunas = ['rotulo', 'preco', 'estoque', 'categoria', 'vendedor'];
    this.colunasDetalhe = [...this.colunas, 'descricao'];
    this.escolha = { colunas: ['rotulo', 'preco', 'estoque'], titulo: 'Produtos' };
    this.escolhaCategoria = { colunas: ['nome'], titulo: 'Categorias' };
    this.escolhaVendedor = { colunas: ['nome', 'email'], titulo: 'Vendedores' };
    this.escolhaNovaCategoria = { colunas: ['nome'], titulo: 'Nova categoria', opcional: true };
    this.escolhaNovoVendedor = { colunas: ['nome', 'email'], titulo: 'Novo vendedor', opcional: true };
  }

  mostrarMenu() {
    this.exibirMenu('PRODUTOS', [
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
  }

  async lerNovoProduto() {
    const rotulo = await perguntar('Rótulo: ');
    const preco = await perguntarNumero('Preço (R$): ');
    const estoque = await perguntarNumero('Estoque: ');
    const descricao = await perguntar('Descrição (opcional): ');
    return { rotulo, preco, estoque, descricao };
  }

  async lerAlteracoes(produto) {
    console.log('Deixe em branco para manter o valor atual.\n');
    const alteracoes = {
      rotulo: await perguntarOpcional(`Rótulo [${produto.rotulo}]: `),
      preco: await perguntarNumeroOpcional(`Preço [${this.formatarPreco(produto.preco)}]: `),
      estoque: await perguntarNumeroOpcional(`Estoque [${produto.estoque}]: `),
      descricao: await perguntarOpcional(`Descrição [${produto.descricao || 'vazio'}]: `),
    };
    this.pularLinha();
    return alteracoes;
  }

  async lerTextoBusca() {
    const texto = await perguntar('Texto do rótulo: ');
    this.pularLinha();
    return texto;
  }

  async lerFaixaDePreco() {
    const min = await perguntarNumero('Preço mínimo (R$): ');
    const max = await perguntarNumero('Preço máximo (R$): ');
    this.pularLinha();
    return { min, max };
  }

  async confirmarExclusao(produto) {
    return confirmar(`Confirma a exclusão de "${produto.rotulo}"?`);
  }

  exibirLista(linhas) {
    this.exibirTabela(linhas, this.colunas);
  }

  exibirDetalhe(linha) {
    this.exibirTabela([linha], this.colunasDetalhe, { comId: true });
  }

  exibirCadastrado(id) {
    this.exibirSucesso(`Produto cadastrado com id ${id}`);
  }

  exibirAtualizado() {
    this.exibirSucesso('Produto atualizado');
  }

  exibirExcluido() {
    this.exibirSucesso('Produto excluído');
  }

  exibirExclusaoCancelada() {
    this.exibirAviso('Exclusão cancelada.');
  }
}

module.exports = ProdutoView;
