const BaseDAO = require('./BaseDAO');
const CategoriaDAO = require('./CategoriaDAO');
const VendedorDAO = require('./VendedorDAO');
const Produto = require('../models/Produto');
const ValidationError = require('../errors/ValidationError');

class ProdutoDAO extends BaseDAO {
  constructor() {
    super('produtos', Produto, 'rotulo');
    this.categoriaDAO = new CategoriaDAO();
    this.vendedorDAO = new VendedorDAO();
  }

  async criarIndices() {
    const colecao = await this.colecao();
    await colecao.createIndex({ idCategoria: 1 });
    await colecao.createIndex({ idVendedor: 1 });
  }

  // Os ids viram ObjectId e a categoria e o vendedor precisam existir.
  async validarRegras(produto) {
    produto.idCategoria = this.paraObjectId(produto.idCategoria, 'idCategoria');
    produto.idVendedor = this.paraObjectId(produto.idVendedor, 'idVendedor');
    await this.categoriaDAO.buscarPorId(produto.idCategoria);
    await this.vendedorDAO.buscarPorId(produto.idVendedor);
  }

  async buscarPorRotulo(texto) {
    if (typeof texto !== 'string' || texto.trim() === '') {
      throw new ValidationError('Informe o texto a buscar no rótulo', 'rotulo');
    }
    // Escapa caracteres especiais de regex; sem isso, buscar "C++" gera erro.
    const seguro = texto.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.listarTodos({ rotulo: { $regex: seguro, $options: 'i' } });
  }

  async buscarPorCategoria(id) {
    const idCategoria = this.paraObjectId(id, 'idCategoria');
    await this.categoriaDAO.buscarPorId(idCategoria);
    return this.listarTodos({ idCategoria });
  }

  async buscarPorVendedor(id) {
    const idVendedor = this.paraObjectId(id, 'idVendedor');
    await this.vendedorDAO.buscarPorId(idVendedor);
    return this.listarTodos({ idVendedor });
  }

  async buscarPorFaixaDePreco(min, max) {
    if (!Number.isFinite(min) || min < 0) {
      throw new ValidationError('Preço mínimo deve ser um número maior ou igual a zero', 'preco');
    }
    if (!Number.isFinite(max) || max < 0) {
      throw new ValidationError('Preço máximo deve ser um número maior ou igual a zero', 'preco');
    }
    if (min > max) {
      throw new ValidationError('Preço mínimo não pode ser maior que o máximo', 'preco');
    }
    return this.listarTodos({ preco: { $gte: min, $lte: max } });
  }
}

module.exports = ProdutoDAO;
