const BaseController = require('./BaseController');
const CategoriaView = require('../views/CategoriaView');
const CategoriaDAO = require('../dao/CategoriaDAO');
const Categoria = require('../models/Categoria');

// Controller de categorias: recebe a opção, pede os dados à View e chama o DAO.
class CategoriaController extends BaseController {
  constructor() {
    super(new CategoriaView());
    this.dao = new CategoriaDAO();
  }

  async iniciar() {
    while (true) {
      this.view.mostrarMenu();
      const opcao = await this.view.lerOpcao();

      switch (opcao) {
        case '1':
          await this.executar('Inserir categoria', () => this.cadastrar());
          break;
        case '2':
          await this.executar('Listar categorias', () => this.listar());
          break;
        case '3':
          await this.executar('Consultar categoria', () => this.consultar());
          break;
        case '4':
          await this.executar('Atualizar categoria', () => this.atualizar());
          break;
        case '5':
          await this.executar('Excluir categoria', () => this.excluir());
          break;
        case '0':
          return;
        default:
          await this.view.opcaoInvalida();
      }
    }
  }

  async cadastrar() {
    const { nome, descricao } = await this.view.lerNovaCategoria();
    const id = await this.dao.inserir(new Categoria(nome, descricao));
    this.view.exibirCadastrada(id);
  }

  async listar() {
    this.view.exibirLista(await this.dao.listarTodos());
  }

  async consultar() {
    const categoria = await this.escolher(this.dao, this.view.escolha);
    this.view.exibirDetalhe(categoria);
  }

  async atualizar() {
    const categoria = await this.escolher(this.dao, this.view.escolha);
    const dados = await this.view.lerAlteracoes(categoria);
    await this.dao.atualizar(categoria.id, dados);
    this.view.exibirAtualizada();
  }

  async excluir() {
    const categoria = await this.escolher(this.dao, this.view.escolha);
    if (await this.view.confirmarExclusao(categoria)) {
      await this.dao.excluir(categoria.id);
      this.view.exibirExcluida();
    } else {
      this.view.exibirExclusaoCancelada();
    }
  }
}

module.exports = CategoriaController;
