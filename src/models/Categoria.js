const ValidationError = require('../errors/ValidationError');

class Categoria {

    constructor (nome, descricao)
    {
        this.nome = nome;
        this.descricao = descricao;
    }

    validar(){
        
        if(typeof this.nome !== 'string'){
            throw new ValidationError ('Campo "nome" pode conter apenas letras', 'nome');
        }
        if(this.nome.trim() === ''){
            throw new ValidationError ('Campo "nome" nao pode ser vazio', 'nome');
        }

    }
}

const ValidationError = require('../errors/ValidationError');

class Categoria {
  constructor(nome, descricao) {
    this.nome = nome;
    this.descricao = descricao;
  }

  validar() {
    if (typeof this.nome !== 'string') {
      throw new ValidationError('Campo "nome" deve ser um texto', 'nome');
    }
    if (this.nome.trim() === '') {
      throw new ValidationError('Campo "nome" não pode ser vazio', 'nome');
    }
    if (this.descricao !== undefined && typeof this.descricao !== 'string') {
      throw new ValidationError('Campo "descricao" deve ser um texto', 'descricao');
    }
  }
}

module.exports = Categoria;