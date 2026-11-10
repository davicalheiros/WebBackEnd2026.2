class NotFoundError extends Error {
  constructor(mensagem, entidade) {
    super(mensagem);
    this.name = 'NotFoundError';
    this.entidade = entidade;
  }
}

module.exports = NotFoundError;