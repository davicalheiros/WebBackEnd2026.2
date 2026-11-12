const ValidationError = require('../errors/ValidationError');

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Vendedor {
    constructor(nome, email) {
        this.nome = nome;
        this.email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    }

    validar() {

        if (typeof this.nome !== 'string') {
            throw new ValidationError('Campo "nome" deve ser um texto', 'nome');
        }
        if (this.nome.trim() === '') {
            throw new ValidationError('Campo "nome" nao pode ser vazio', 'nome');
        }
        if (typeof this.email !== 'string') {
            throw new ValidationError('Campo "email" deve ser um texto', 'email');
        }
        if (this.email.trim() === '') {
            throw new ValidationError('Campo "email" nao pode ser vazio', 'email');
        }
        if (!formatoEmail.test(this.email.trim())) {
            throw new ValidationError('Campo "email" com formato invalido', 'email');
        }
    }
}

module.exports = Vendedor;