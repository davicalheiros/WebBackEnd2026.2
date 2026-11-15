const BaseView = require('./BaseView');
const { perguntar, perguntarOpcional, confirmar } = require('./terminal');

// View de categorias: menu, formulários e mensagens, sem acessar o banco.
class CategoriaView extends BaseView {
  constructor() {
    super();
    this.colunas = ['nome', 'descricao'];
    this.escolha = { colunas: this.colunas, titulo: 'Categorias' };
  }

  mostrarMenu() {
    this.exibirMenu('CATEGORIAS', [
      ['1', 'Cadastrar'],
      ['2', 'Listar'],
      ['3', 'Consultar'],
      ['4', 'Atualizar'],
      ['5', 'Excluir'],
      ['0', 'Voltar'],
    ]);
  }

  async lerNovaCategoria() {
    const nome = await perguntar('Nome: ');
    const descricao = await perguntar('Descrição (opcional): ');
    return { nome, descricao };
  }

  async lerAlteracoes(categoria) {
    console.log('Deixe em branco para manter o valor atual.\n');
    return {
      nome: await perguntarOpcional(`Nome [${categoria.nome}]: `),
      descricao: await perguntarOpcional(`Descrição [${categoria.descricao || 'vazio'}]: `),
    };
  }

  async confirmarExclusao(categoria) {
    return confirmar(`Confirma a exclusão de "${categoria.nome}"?`);
  }

  exibirLista(categorias) {
    this.exibirTabela(categorias, this.colunas);
  }

  exibirDetalhe(categoria) {
    this.exibirTabela([categoria], this.colunas, { comId: true });
  }

  exibirCadastrada(id) {
    this.exibirSucesso(`Categoria cadastrada com id ${id}`);
  }

  exibirAtualizada() {
    this.exibirSucesso('Categoria atualizada');
  }

  exibirExcluida() {
    this.exibirSucesso('Categoria excluída');
  }

  exibirExclusaoCancelada() {
    this.exibirAviso('Exclusão cancelada.');
  }
}

module.exports = CategoriaView;
