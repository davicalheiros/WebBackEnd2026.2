const BaseModel = require('./BaseModel');
const Categoria = require('./Categoria');
const Vendedor = require('./Vendedor');
const ValidationError = require('../errors/ValidationError');

class Produto extends BaseModel {
  static nomeColecao = 'produtos';
  static nomeEntidade = 'Produto';
  static campoOrdenacao = 'rotulo';

  static deDocumento(doc) {
    return new Produto(doc.rotulo, doc.preco, doc.estoque, doc.idCategoria, doc.idVendedor, doc.descricao);
  }

  constructor(rotulo, preco, estoque, idCategoria, idVendedor, descricao = '') {
    super();
    this.rotulo = typeof rotulo === 'string' ? rotulo.trim() : rotulo;
    this.preco = preco;
    this.estoque = estoque;
    this.idCategoria = idCategoria;
    this.idVendedor = idVendedor;
    this.descricao = typeof descricao === 'string' ? descricao.trim() : descricao;
  }

  validar() {
    if (typeof this.rotulo !== 'string' || this.rotulo === '') {
      throw new ValidationError('Campo "rotulo" obrigatório', 'rotulo');
    }
    if (!Number.isFinite(this.preco) || this.preco <= 0) {
      throw new ValidationError('Campo "preco" deve ser um número maior que zero', 'preco');
    }
    if (!Number.isInteger(this.estoque) || this.estoque < 0) {
      throw new ValidationError('Campo "estoque" deve ser um inteiro maior ou igual a zero', 'estoque');
    }
    if (!this.idCategoria) {
      throw new ValidationError('Campo "idCategoria" obrigatório', 'idCategoria');
    }
    if (!this.idVendedor) {
      throw new ValidationError('Campo "idVendedor" obrigatório', 'idVendedor');
    }
    if (typeof this.descricao !== 'string') {
      throw new ValidationError('Campo "descricao" deve ser um texto', 'descricao');
    }
  }

  // Regras que dependem do banco: converte os ids para ObjectId e confere se existem
  async validarRegras() {
    this.idCategoria = Produto.paraObjectId(this.idCategoria, 'idCategoria');
    this.idVendedor = Produto.paraObjectId(this.idVendedor, 'idVendedor');
    await Categoria.buscarPorId(this.idCategoria);
    await Vendedor.buscarPorId(this.idVendedor);
  }

  static async criarIndices() {
    const colecao = await this.colecao();
    await colecao.createIndex({ idCategoria: 1 });
    await colecao.createIndex({ idVendedor: 1 });
  }

  static async buscarPorRotulo(texto) {
    if (typeof texto !== 'string' || texto.trim() === '') {
      throw new ValidationError('Informe o texto a buscar no rótulo', 'rotulo');
    }
    // Escapa caracteres especiais de regex, senão buscar "C++" gera erro
    const seguro = texto.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.listarTodos({ rotulo: { $regex: seguro, $options: 'i' } });
  }

  static async buscarPorCategoria(id) {
    const idCategoria = this.paraObjectId(id, 'idCategoria');
    await Categoria.buscarPorId(idCategoria);
    return this.listarTodos({ idCategoria });
  }

  static async buscarPorVendedor(id) {
    const idVendedor = this.paraObjectId(id, 'idVendedor');
    await Vendedor.buscarPorId(idVendedor);
    return this.listarTodos({ idVendedor });
  }

  static async buscarPorFaixaDePreco(min, max) {
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

module.exports = Produto;