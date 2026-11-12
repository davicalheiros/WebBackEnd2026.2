const BaseModel = require('./BaseModel');
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
}

module.exports = Produto;