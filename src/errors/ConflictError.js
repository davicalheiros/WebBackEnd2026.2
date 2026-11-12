class ConflictError extends Error {
  constructor(mensagem, campo) {
    super(mensagem);
    this.name = 'ConflictError';
    this.campo = campo;
  }
}

module.exports = ConflictError;
