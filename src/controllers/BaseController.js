const Logger = require('../utils/Logger');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const EntradaEncerradaError = require('../errors/EntradaEncerradaError');

// Controller: coordena View e DAO; captura os erros de cada operação e registra no log.
class BaseController {
  constructor(view) {
    this.view = view;
  }

  // Único ponto que captura os erros das operações: mostra a mensagem e registra no log.
  async executar(operacao, fn) {
    this.view.pularLinha();
    try {
      await fn();
    } catch (erro) {
      if (erro instanceof EntradaEncerradaError) {
        throw erro;
      }
      Logger.erro(erro, operacao);
      this.view.exibirErro(erro);
    }
    await this.view.pausar();
  }

  // A View mostra a lista; o controller interpreta a resposta (número, id colado ou vazio).
  async escolher(dao, { colunas, titulo, opcional = false }) {
    const itens = await dao.listarTodos();
    if (itens.length === 0) {
      if (opcional) return undefined;
      throw new NotFoundError(`Nenhum(a) ${dao.nomeEntidade} cadastrado(a)`, dao.nomeEntidade);
    }

    const resposta = await this.view.escolherNaLista(itens, colunas, titulo, opcional);

    if (resposta === '') {
      if (opcional) {
        this.view.pularLinha();
        return undefined;
      }
      throw new ValidationError(`Escolha um item da lista de ${titulo.toLowerCase()}`, 'id');
    }
    if (/^\d{1,6}$/.test(resposta)) {
      const numero = Number(resposta);
      if (numero < 1 || numero > itens.length) {
        throw new ValidationError(`Número fora da lista (escolha de 1 a ${itens.length})`, 'id');
      }
      this.view.pularLinha();
      return itens[numero - 1];
    }
    const item = await dao.buscarPorId(resposta);
    this.view.pularLinha();
    return item;
  }
}

module.exports = BaseController;
