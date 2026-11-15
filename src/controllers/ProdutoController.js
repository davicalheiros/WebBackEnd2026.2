const BaseController = require('./BaseController');
const ProdutoView = require('../views/ProdutoView');
const ProdutoDAO = require('../dao/ProdutoDAO');
const CategoriaDAO = require('../dao/CategoriaDAO');
const VendedorDAO = require('../dao/VendedorDAO');
const Produto = require('../models/Produto');

class ProdutoController extends BaseController {
  constructor() {
    super(new ProdutoView());
    this.dao = new ProdutoDAO();
    this.categoriaDAO = new CategoriaDAO();
    this.vendedorDAO = new VendedorDAO();
  }

  async iniciar() {
    while (true) {
      this.view.mostrarMenu();
      const opcao = await this.view.lerOpcao();

      switch (opcao) {
        case '1':
          await this.executar('Inserir produto', () => this.cadastrar());
          break;
        case '2':
          await this.executar('Listar produtos', () => this.listar());
          break;
        case '3':
          await this.executar('Consultar produto', () => this.consultar());
          break;
        case '4':
          await this.executar('Atualizar produto', () => this.atualizar());
          break;
        case '5':
          await this.executar('Excluir produto', () => this.excluir());
          break;
        case '6':
          await this.executar('Buscar produtos por rótulo', () => this.buscarPorRotulo());
          break;
        case '7':
          await this.executar('Buscar produtos por categoria', () => this.buscarPorCategoria());
          break;
        case '8':
          await this.executar('Buscar produtos por vendedor', () => this.buscarPorVendedor());
          break;
        case '9':
          await this.executar('Buscar produtos por faixa de preço', () => this.buscarPorFaixaDePreco());
          break;
        case '0':
          return;
        default:
          await this.view.opcaoInvalida();
      }
    }
  }

  async montarLinhas(produtos) {
    const categorias = new Map((await this.categoriaDAO.listarTodos()).map((c) => [String(c.id), c.nome]));
    const vendedores = new Map((await this.vendedorDAO.listarTodos()).map((v) => [String(v.id), v.nome]));
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

  async cadastrar() {
    const categoria = await this.escolher(this.categoriaDAO, this.view.escolhaCategoria);
    const vendedor = await this.escolher(this.vendedorDAO, this.view.escolhaVendedor);
    const { rotulo, preco, estoque, descricao } = await this.view.lerNovoProduto();
    const id = await this.dao.inserir(new Produto(rotulo, preco, estoque, categoria.id, vendedor.id, descricao));
    this.view.exibirCadastrado(id);
  }

  async listar() {
    this.view.exibirLista(await this.montarLinhas(await this.dao.listarTodos()));
  }

  async consultar() {
    const produto = await this.escolher(this.dao, this.view.escolha);
    const [linha] = await this.montarLinhas([produto]);
    this.view.exibirDetalhe(linha);
  }

  async atualizar() {
    const produto = await this.escolher(this.dao, this.view.escolha);
    const alteracoes = await this.view.lerAlteracoes(produto);
    const categoria = await this.escolher(this.categoriaDAO, this.view.escolhaNovaCategoria);
    const vendedor = await this.escolher(this.vendedorDAO, this.view.escolhaNovoVendedor);
    await this.dao.atualizar(produto.id, {
      ...alteracoes,
      idCategoria: categoria?.id,
      idVendedor: vendedor?.id,
    });
    this.view.exibirAtualizado();
  }

  async excluir() {
    const produto = await this.escolher(this.dao, this.view.escolha);
    if (await this.view.confirmarExclusao(produto)) {
      await this.dao.excluir(produto.id);
      this.view.exibirExcluido();
    } else {
      this.view.exibirExclusaoCancelada();
    }
  }

  async buscarPorRotulo() {
    const texto = await this.view.lerTextoBusca();
    this.view.exibirLista(await this.montarLinhas(await this.dao.buscarPorRotulo(texto)));
  }

  async buscarPorCategoria() {
    const categoria = await this.escolher(this.categoriaDAO, this.view.escolhaCategoria);
    this.view.exibirLista(await this.montarLinhas(await this.dao.buscarPorCategoria(categoria.id)));
  }

  async buscarPorVendedor() {
    const vendedor = await this.escolher(this.vendedorDAO, this.view.escolhaVendedor);
    this.view.exibirLista(await this.montarLinhas(await this.dao.buscarPorVendedor(vendedor.id)));
  }

  async buscarPorFaixaDePreco() {
    const { min, max } = await this.view.lerFaixaDePreco();
    this.view.exibirLista(await this.montarLinhas(await this.dao.buscarPorFaixaDePreco(min, max)));
  }
}

module.exports = ProdutoController;
