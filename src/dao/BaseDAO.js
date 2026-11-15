const { ObjectId } = require('mongodb');
const { conectar } = require('../config/database');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

class BaseDAO {
  constructor(nomeColecao, Entidade, campoOrdenacao) {
    this.nomeColecao = nomeColecao;
    this.Entidade = Entidade;
    this.nomeEntidade = Entidade.name;
    this.campoOrdenacao = campoOrdenacao;
  }

  async colecao() {
    const db = await conectar();
    return db.collection(this.nomeColecao);
  }

  paraObjectId(valor, campo = 'id') {
    if (valor instanceof ObjectId) {
      return valor;
    }
    if (typeof valor === 'string' && /^[0-9a-fA-F]{24}$/.test(valor)) {
      return new ObjectId(valor);
    }
    throw new ValidationError(`Campo "${campo}" não é um id válido`, campo);
  }

  converterErroDuplicidade(erro, documento) {
    if (erro.code === 11000) {
      const [campo] = Object.keys(erro.keyValue ?? {});
      if (!campo) {
        return new ConflictError(`${this.nomeEntidade} duplicado(a)`, undefined);
      }
      return new ConflictError(`Já existe ${this.nomeEntidade} com ${campo} "${documento[campo]}"`, campo);
    }
    return erro;
  }

  async criarIndices() {}

  async validarRegras(entidade) {}

  async inserir(entidade) {
    entidade.validar();
    await this.validarRegras(entidade);

    const colecao = await this.colecao();
    const documento = entidade.paraDocumento();
    try {
      const resultado = await colecao.insertOne(documento);
      entidade.id = resultado.insertedId;
      return entidade.id;
    } catch (erro) {
      throw this.converterErroDuplicidade(erro, documento);
    }
  }

  async buscarPorId(id) {
    const _id = this.paraObjectId(id);
    const colecao = await this.colecao();
    const documento = await colecao.findOne({ _id });

    if (!documento) {
      throw new NotFoundError(`${this.nomeEntidade} com id ${_id} não encontrado(a)`, this.nomeEntidade);
    }
    return this.Entidade.deDocumento(documento);
  }

  async listarTodos(filtro = {}) {
    const colecao = await this.colecao();
    const documentos = await colecao
      .find(filtro)
      .sort({ [this.campoOrdenacao]: 1 })
      .collation({ locale: 'pt' })
      .toArray();
    return documentos.map((documento) => this.Entidade.deDocumento(documento));
  }

  async atualizar(id, dados) {
    const _id = this.paraObjectId(id);
    const entidade = await this.buscarPorId(_id);

    const camposPermitidos = Object.keys(entidade.paraDocumento());
    for (const [campo, valor] of Object.entries(dados)) {
      if (valor !== undefined && camposPermitidos.includes(campo)) {
        entidade[campo] = valor;
      }
    }

    entidade.validar();
    await this.validarRegras(entidade);

    const colecao = await this.colecao();
    const documento = entidade.paraDocumento();
    try {
      await colecao.updateOne({ _id }, { $set: documento });
    } catch (erro) {
      throw this.converterErroDuplicidade(erro, documento);
    }
    return this.buscarPorId(_id);
  }

  async excluir(id) {
    const _id = this.paraObjectId(id);
    const colecao = await this.colecao();
    const resultado = await colecao.deleteOne({ _id });

    if (resultado.deletedCount === 0) {
      throw new NotFoundError(`${this.nomeEntidade} com id ${_id} não encontrado(a)`, this.nomeEntidade);
    }
    return true;
  }
}

module.exports = BaseDAO;
