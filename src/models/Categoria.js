const ValidationError = require('../errors/ValidationError');

class Categoria {

    constructor (nome, descricao)
    {
        this.nome = nome;
        this.descricao = descricao;
    }

    validar(){
        
        if(typeof this.nome !== 'string'){
            throw new ValidationError ('Campo "Nome" pode conter apenas letras', 'nome');
        }
        if(this.nome.trim() === ''){
            throw new ValidationError ('Campo "Nome" nao pode ser vazio', 'nome');
        }

    }
}

module.exports = Categoria; 