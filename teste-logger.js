const Logger = require('./src/utils/Logger');
const ValidationError = require('./src/errors/ValidationError');
const NotFoundError = require('./src/errors/NotFoundError');

Logger.erro(new ValidationError('Campo "nome" nao pode ser vazio', 'nome'), 'Inserir categoria');
Logger.erro(new NotFoundError('Produto nao encontrado', 'Produto'), 'Excluir produto');

console.log('Registros gravados em logs/erros.log');