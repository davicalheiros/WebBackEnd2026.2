const ValidationError = require('../errors/ValidationError');

class Produto {

    constructor(rotulo, preco, estoque, idCategoria, idVendedor, descricao = '') {

        this.rotulo = rotulo;
        this.preco = preco;
        this.estoque = estoque;
        this.idCategoria = idCategoria;
        this.idVendedor = idVendedor;
        this.descricao = descricao;
    }

  validar() {

    if (typeof this.rotulo !== 'string' || this.rotulo.trim() === '') {
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
    
  }
}

module.exports = Produto;