// Indica que a entrada acabou (Ctrl+D ou fim de um pipe); o programa encerra sem tratar como falha.
class EntradaEncerradaError extends Error {
  constructor() {
    super('Entrada encerrada');
    this.name = 'EntradaEncerradaError';
  }
}

module.exports = EntradaEncerradaError;
