// Falha de infraestrutura, como a conexão com o MongoDB; guarda o erro original em causa.
class DatabaseError extends Error {
  constructor(mensagem, causa) {
    super(mensagem);
    this.name = 'DatabaseError';
    this.causa = causa;
  }
}

module.exports = DatabaseError;
