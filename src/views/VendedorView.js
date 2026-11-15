const BaseView = require('./BaseView');
const { perguntar, perguntarOpcional, confirmar } = require('./terminal');

// View de vendedores: menu, formulários e mensagens, sem acessar o banco.
class VendedorView extends BaseView {
  constructor() {
    super();
    this.colunas = ['nome', 'email'];
    this.escolha = { colunas: this.colunas, titulo: 'Vendedores' };
  }

  mostrarMenu() {
    this.exibirMenu('VENDEDORES', [
      ['1', 'Cadastrar'],
      ['2', 'Listar'],
      ['3', 'Consultar'],
      ['4', 'Atualizar'],
      ['5', 'Excluir'],
      ['0', 'Voltar'],
    ]);
  }

  async lerNovoVendedor() {
    const nome = await perguntar('Nome: ');
    const email = await perguntar('Email: ');
    return { nome, email };
  }

  async lerAlteracoes(vendedor) {
    console.log('Deixe em branco para manter o valor atual.\n');
    return {
      nome: await perguntarOpcional(`Nome [${vendedor.nome}]: `),
      email: await perguntarOpcional(`Email [${vendedor.email}]: `),
    };
  }

  async confirmarExclusao(vendedor) {
    return confirmar(`Confirma a exclusão de "${vendedor.nome}"?`);
  }

  exibirLista(vendedores) {
    this.exibirTabela(vendedores, this.colunas);
  }

  exibirDetalhe(vendedor) {
    this.exibirTabela([vendedor], this.colunas, { comId: true });
  }

  exibirCadastrado(id) {
    this.exibirSucesso(`Vendedor cadastrado com id ${id}`);
  }

  exibirAtualizado() {
    this.exibirSucesso('Vendedor atualizado');
  }

  exibirExcluido() {
    this.exibirSucesso('Vendedor excluído');
  }

  exibirExclusaoCancelada() {
    this.exibirAviso('Exclusão cancelada.');
  }
}

module.exports = VendedorView;
