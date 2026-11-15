const BaseController = require('./BaseController');
const VendedorView = require('../views/VendedorView');
const VendedorDAO = require('../dao/VendedorDAO');
const Vendedor = require('../models/Vendedor');

class VendedorController extends BaseController {
  constructor() {
    super(new VendedorView());
    this.dao = new VendedorDAO();
  }

  async iniciar() {
    while (true) {
      this.view.mostrarMenu();
      const opcao = await this.view.lerOpcao();

      switch (opcao) {
        case '1':
          await this.executar('Inserir vendedor', () => this.cadastrar());
          break;
        case '2':
          await this.executar('Listar vendedores', () => this.listar());
          break;
        case '3':
          await this.executar('Consultar vendedor', () => this.consultar());
          break;
        case '4':
          await this.executar('Atualizar vendedor', () => this.atualizar());
          break;
        case '5':
          await this.executar('Excluir vendedor', () => this.excluir());
          break;
        case '0':
          return;
        default:
          await this.view.opcaoInvalida();
      }
    }
  }

  async cadastrar() {
    const { nome, email } = await this.view.lerNovoVendedor();
    const id = await this.dao.inserir(new Vendedor(nome, email));
    this.view.exibirCadastrado(id);
  }

  async listar() {
    this.view.exibirLista(await this.dao.listarTodos());
  }

  async consultar() {
    const vendedor = await this.escolher(this.dao, this.view.escolha);
    this.view.exibirDetalhe(vendedor);
  }

  async atualizar() {
    const vendedor = await this.escolher(this.dao, this.view.escolha);
    const dados = await this.view.lerAlteracoes(vendedor);
    await this.dao.atualizar(vendedor.id, dados);
    this.view.exibirAtualizado();
  }

  async excluir() {
    const vendedor = await this.escolher(this.dao, this.view.escolha);
    if (await this.view.confirmarExclusao(vendedor)) {
      await this.dao.excluir(vendedor.id);
      this.view.exibirExcluido();
    } else {
      this.view.exibirExclusaoCancelada();
    }
  }
}

module.exports = VendedorController;
