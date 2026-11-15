const BaseDAO = require('./BaseDAO');
const Vendedor = require('../models/Vendedor');
const { conectar } = require('../config/database');
const ConflictError = require('../errors/ConflictError');

class VendedorDAO extends BaseDAO {
  constructor() {
    super('vendedores', Vendedor, 'nome');
  }

  // Email único.
  async criarIndices() {
    const colecao = await this.colecao();
    await colecao.createIndex({ email: 1 }, { unique: true });
  }

  // O MongoDB não faz exclusão em cascata. Consulta a coleção direto para evitar require circular com o ProdutoDAO.
  async excluir(id) {
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

module.exports = VendedorDAO;
