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

module.exports = Categoria; 