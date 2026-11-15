const ValidationError = require('../errors/ValidationError');

class Categoria {
  #id = null;
  #nome;
  #descricao;

  constructor(nome, descricao = '') {
    this.nome = nome;
    this.descricao = descricao;
  }

  static deDocumento(documento) {
    const categoria = new Categoria(documento.nome, documento.descricao);
    categoria.id = documento._id;
    return categoria;
  }

  get id() {
    return this.#id;
  }

  set id(valor) {
    this.#id = valor;
  }

  get nome() {
    return this.#nome;
  }

  set nome(valor) {
    this.#nome = typeof valor === 'string' ? valor.trim() : valor;
  }

  get descricao() {
    return this.#descricao;
  }

  set descricao(valor) {
    this.#descricao = typeof valor === 'string' ? valor.trim() : valor;
  }

  validar() {
    if (typeof this.nome !== 'string') {
      throw new ValidationError('Campo "nome" deve ser um texto', 'nome');
    }
    if (this.nome === '') {
      throw new ValidationError('Campo "nome" não pode ser vazio', 'nome');
    }
    if (typeof this.descricao !== 'string') {
      throw new ValidationError('Campo "descricao" deve ser um texto', 'descricao');
    }
  }

  paraDocumento() {
    return { nome: this.#nome, descricao: this.#descricao };
  }
}

module.exports = Categoria;
