const BaseModel = require('./BaseModel');
const ValidationError = require('../errors/ValidationError');

class Categoria extends BaseModel {
  static nomeColecao = 'categorias';
  static nomeEntidade = 'Categoria';
  static campoOrdenacao = 'nome';

  static deDocumento(doc) {
    return new Categoria(doc.nome, doc.descricao);
  }

  constructor(nome, descricao = '') {
    super();
    this.nome = typeof nome === 'string' ? nome.trim() : nome;
    this.descricao = typeof descricao === 'string' ? descricao.trim() : descricao;
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
}

module.exports = Categoria;
