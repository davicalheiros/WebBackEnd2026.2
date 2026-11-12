const BaseModel = require('./BaseModel');
const { conectar } = require('../config/database');
const ConflictError = require('../errors/ConflictError');
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

  static async criarIndices() {
    const colecao = await this.colecao();
    await colecao.createIndex({ nome: 1 }, { unique: true, collation: { locale: 'pt', strength: 2 } });
  }

  // Não usa require('./Produto') para evitar dependência circular
  static async excluir(id) {
    const _id = this.paraObjectId(id);
    await this.buscarPorId(_id);
    const db = await conectar();
    const vinculados = await db.collection('produtos').countDocuments({ idCategoria: _id });
    if (vinculados > 0) {
      throw new ConflictError(
        `Categoria possui ${vinculados} produto(s) vinculado(s) e não pode ser excluída`,
        'idCategoria'
      );
    }
    return super.excluir(_id);
  }
}

module.exports = Categoria;
