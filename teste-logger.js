const Logger = require('./src/utils/Logger');
const ValidationError = require('./src/errors/ValidationError');
const NotFoundError = require('./src/errors/NotFoundError');
const ConflictError = require('./src/errors/ConflictError');
const DatabaseError = require('./src/errors/DatabaseError');

Logger.erro(new ValidationError('Campo "nome" nao pode ser vazio', 'nome'), 'Inserir categoria');
Logger.erro(new NotFoundError('Produto nao encontrado', 'Produto'), 'Excluir produto');
Logger.erro(new ConflictError('Ja existe Vendedor com email "ana@loja.com"', 'email'), 'Inserir vendedor');
Logger.erro(new DatabaseError('Nao foi possivel conectar ao MongoDB', new Error('timeout')), 'Conectar ao MongoDB');

console.log('Registros gravados em logs/erros.log');
