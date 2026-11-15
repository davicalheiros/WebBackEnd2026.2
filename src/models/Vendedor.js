const ValidationError = require('../errors/ValidationError');

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Vendedor {
  #id = null;
  #nome;
  #email;

  constructor(nome, email) {
    this.nome = nome;
    this.email = email;
  }

  static deDocumento(documento) {
    const vendedor = new Vendedor(documento.nome, documento.email);
    vendedor.id = documento._id;
    return vendedor;
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

  get email() {
    return this.#email;
  }

  set email(valor) {
    this.#email = typeof valor === 'string' ? valor.trim().toLowerCase() : valor;
  }

  validar() {
    if (typeof this.nome !== 'string') {
      throw new ValidationError('Campo "nome" deve ser um texto', 'nome');
    }
    if (this.nome === '') {
      throw new ValidationError('Campo "nome" não pode ser vazio', 'nome');
    }
    if (typeof this.email !== 'string') {
      throw new ValidationError('Campo "email" deve ser um texto', 'email');
    }
    if (this.email === '') {
      throw new ValidationError('Campo "email" não pode ser vazio', 'email');
    }
    if (!formatoEmail.test(this.email)) {
      throw new ValidationError('Campo "email" com formato inválido', 'email');
    }
  }

  paraDocumento() {
    return { nome: this.#nome, email: this.#email };
  }
}

module.exports = Vendedor;
