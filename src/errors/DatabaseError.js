class DatabaseError extends Error {
  constructor(mensagem, causa) {
    super(mensagem);
    this.name = 'DatabaseError';
    this.causa = causa;
  }
}

module.exports = DatabaseError;
