const BaseDAO = require('./BaseDAO');
const Categoria = require('../models/Categoria');
const { conectar } = require('../config/database');
const ConflictError = require('../errors/ConflictError');

class CategoriaDAO extends BaseDAO {
  constructor() {
    super('categorias', Categoria, 'nome');
  }

  // Nome único; strength 2 ignora maiúsculas ("Casa" e "casa" são iguais).
  async criarIndices() {
    const colecao = await this.colecao();
    await colecao.createIndex({ nome: 1 }, { unique: true, collation: { locale: 'pt', strength: 2 } });
  }

  // O MongoDB não faz exclusão em cascata. Consulta a coleção direto para evitar require circular com o ProdutoDAO.
  async excluir(id) {
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

module.exports = CategoriaDAO;
