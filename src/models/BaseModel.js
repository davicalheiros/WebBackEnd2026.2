const { ObjectId } = require('mongodb');
const { conectar } = require('../config/database');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

class BaseModel {
  static async colecao() {
    const db = await conectar();
    return db.collection(this.nomeColecao);
  }

  static paraObjectId(valor, campo = 'id') {
    if (valor instanceof ObjectId) {
      return valor;
    }
    if (typeof valor === 'string' && /^[0-9a-fA-F]{24}$/.test(valor)) {
      return new ObjectId(valor);
    }
    throw new ValidationError(`Campo "${campo}" não é um id válido`, campo);
  }

  static converterErroDuplicidade(erro, documento) {
    if (erro.code === 11000) {
      const [campo] = Object.keys(erro.keyValue ?? {});
      if (!campo) {
        return new ConflictError(`${this.nomeEntidade} duplicado(a)`, undefined);
      }
      return new ConflictError(`Já existe ${this.nomeEntidade} com ${campo} "${documento[campo]}"`, campo);
    }
    return erro;
  }

  static async criarIndices() {}

  async validarRegras() {}

  paraDocumento() {
    const { _id, ...documento } = this;
    return documento;
  }

  async inserir() {
    this.validar();
    await this.validarRegras();

    const colecao = await this.constructor.colecao();
    const documento = this.paraDocumento();
    try {
      const resultado = await colecao.insertOne(documento);
      this._id = resultado.insertedId;
      return this._id;
    } catch (erro) {
      throw this.constructor.converterErroDuplicidade(erro, documento);
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
    return colecao
      .find(filtro)
      .sort({ [this.campoOrdenacao]: 1 })
      .collation({ locale: 'pt' })
      .toArray();
  }

  static async atualizar(id, dados) {
    const _id = this.paraObjectId(id);
    const atual = await this.buscarPorId(_id);

    const preenchidos = Object.fromEntries(
      Object.entries(dados).filter(([, valor]) => valor !== undefined)
    );

    const { _id: _ignorado, ...mesclado } = { ...atual, ...preenchidos };

    const instancia = this.deDocumento(mesclado);
    instancia.validar();
    await instancia.validarRegras();

    const colecao = await this.colecao();
    const documento = instancia.paraDocumento();
    try {
      await colecao.updateOne({ _id }, { $set: documento });
    } catch (erro) {
      throw this.converterErroDuplicidade(erro, documento);
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
