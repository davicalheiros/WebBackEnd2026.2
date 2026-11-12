const { ObjectId } = require('mongodb');
const { conectar } = require('../config/database');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

// Classe-mãe do acesso a dados. Cada subclasse deve declarar:
//   static nomeColecao, static nomeEntidade, static campoOrdenacao,
//   static deDocumento(doc) e o método validar().
// O nome da coleção é static porque os métodos static (listar, buscar,
// atualizar, excluir) não têm acesso a propriedades de instância.
class BaseModel {
  static async colecao() {
    const db = await conectar();
    return db.collection(this.nomeColecao);
  }

  static paraObjectId(valor, campo = '_id') {
    if (valor instanceof ObjectId) {
      return valor;
    }
    // ObjectId.isValid aceita qualquer texto de 12 caracteres, por isso o formato é conferido também
    if (typeof valor === 'string' && /^[0-9a-fA-F]{24}$/.test(valor)) {
      return new ObjectId(valor);
    }
    throw new ValidationError(`Campo "${campo}" não é um id válido`, campo);
  }

  // Erro 11000 do MongoDB = violação de índice único
  static converterErroDuplicidade(erro) {
    if (erro.code === 11000) {
      const [campo, valor] = Object.entries(erro.keyValue)[0];
      return new ConflictError(`Já existe ${this.nomeEntidade} com ${campo} "${valor}"`, campo);
    }
    return erro;
  }

  // Índices da coleção; subclasses sobrescrevem quando precisarem
  static async criarIndices() {}

  // Gancho para regras que dependem do banco; validar() cuida só do formato
  async validarRegras() {}

  paraDocumento() {
    const { _id, ...documento } = this;
    return documento;
  }

  async inserir() {
    this.validar();
    await this.validarRegras();

    const colecao = await this.constructor.colecao();
    try {
      const resultado = await colecao.insertOne(this.paraDocumento());
      this._id = resultado.insertedId;
      return this._id;
    } catch (erro) {
      throw this.constructor.converterErroDuplicidade(erro);
    }
  }

  static async buscarPorId(id) {
    const _id = this.paraObjectId(id);
    const colecao = await this.colecao();
    const documento = await colecao.findOne({ _id });

    if (!documento) {
      throw new NotFoundError(`${this.nomeEntidade} com id ${_id} não encontrado(a)`, this.nomeEntidade);
    }
    return documento;
  }

  static async listarTodos(filtro = {}) {
    const colecao = await this.colecao();
    return colecao.find(filtro).sort({ [this.campoOrdenacao]: 1 }).toArray();
  }

  static async atualizar(id, dados) {
    const _id = this.paraObjectId(id);
    const atual = await this.buscarPorId(_id);

    // O _id é descartado para que ninguém consiga trocá-lo pelos dados
    const { _id: _ignorado, ...mesclado } = { ...atual, ...dados };

    // Reaproveita as regras de validação da própria entidade
    const instancia = this.deDocumento(mesclado);
    instancia.validar();
    await instancia.validarRegras();

    const colecao = await this.colecao();
    try {
      await colecao.updateOne({ _id }, { $set: instancia.paraDocumento() });
    } catch (erro) {
      throw this.converterErroDuplicidade(erro);
    }
    return this.buscarPorId(_id);
  }

  static async excluir(id) {
    const _id = this.paraObjectId(id);
    const colecao = await this.colecao();
    const resultado = await colecao.deleteOne({ _id });

    if (resultado.deletedCount === 0) {
      throw new NotFoundError(`${this.nomeEntidade} com id ${_id} não encontrado(a)`, this.nomeEntidade);
    }
    return true;
  }
}

module.exports = BaseModel;
