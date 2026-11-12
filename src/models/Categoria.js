const ValidationError = require('../errors/ValidationError');

class Categoria {
  constructor(nome, descricao = '') {
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
