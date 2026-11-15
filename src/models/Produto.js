const ValidationError = require('../errors/ValidationError');

// Produto à venda. Guarda os ids da categoria e do vendedor (relacionamento por referência).
class Produto {
  #id = null;
  #rotulo;
  #preco;
  #estoque;
  #idCategoria;
  #idVendedor;
  #descricao;

  constructor(rotulo, preco, estoque, idCategoria, idVendedor, descricao = '') {
    this.rotulo = rotulo;
    this.preco = preco;
    this.estoque = estoque;
    this.idCategoria = idCategoria;
    this.idVendedor = idVendedor;
    this.descricao = descricao;
  }

  static deDocumento(documento) {
    const produto = new Produto(
      documento.rotulo,
      documento.preco,
      documento.estoque,
      documento.idCategoria,
      documento.idVendedor,
      documento.descricao
    );
    produto.id = documento._id;
    return produto;
  }

  get id() {
    return this.#id;
  }

  set id(valor) {
    this.#id = valor;
  }

  get rotulo() {
    return this.#rotulo;
  }

  // Os setters só normalizam o valor; a validação fica em validar(), que informa o campo inválido.
  set rotulo(valor) {
    this.#rotulo = typeof valor === 'string' ? valor.trim() : valor;
  }

  get preco() {
    return this.#preco;
  }

  set preco(valor) {
    this.#preco = valor;
  }

  get estoque() {
    return this.#estoque;
  }

  set estoque(valor) {
    this.#estoque = valor;
  }

  get idCategoria() {
    return this.#idCategoria;
  }

  set idCategoria(valor) {
    this.#idCategoria = valor;
  }

  get idVendedor() {
    return this.#idVendedor;
  }

  set idVendedor(valor) {
    this.#idVendedor = valor;
  }

  get descricao() {
    return this.#descricao;
  }

  set descricao(valor) {
    this.#descricao = typeof valor === 'string' ? valor.trim() : valor;
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

  paraDocumento() {
    return {
      rotulo: this.#rotulo,
      preco: this.#preco,
      estoque: this.#estoque,
      idCategoria: this.#idCategoria,
      idVendedor: this.#idVendedor,
      descricao: this.#descricao,
    };
  }
}

module.exports = Produto;
