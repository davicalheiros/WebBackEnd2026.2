const BaseModel = require('./BaseModel');
const { conectar } = require('../config/database');
const ConflictError = require('../errors/ConflictError');
const ValidationError = require('../errors/ValidationError');

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Vendedor extends BaseModel {
  static nomeColecao = 'vendedores';
  static nomeEntidade = 'Vendedor';
  static campoOrdenacao = 'nome';

  static deDocumento(doc) {
    return new Vendedor(doc.nome, doc.email);
  }

  constructor(nome, email) {
    super();
    this.nome = typeof nome === 'string' ? nome.trim() : nome;
    this.email = typeof email === 'string' ? email.trim().toLowerCase() : email;
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

  static async criarIndices() {
    const colecao = await this.colecao();
    await colecao.createIndex({ email: 1 }, { unique: true });
  }

  static async excluir(id) {
    const _id = this.paraObjectId(id);
    await this.buscarPorId(_id);
    const db = await conectar();
    const vinculados = await db.collection('produtos').countDocuments({ idVendedor: _id });
    if (vinculados > 0) {
      throw new ConflictError(
        `Vendedor possui ${vinculados} produto(s) vinculado(s) e não pode ser excluído`,
        'idVendedor'
      );
    }
    return super.excluir(_id);
  }
}

module.exports = Vendedor;
