const Logger = require('../utils/Logger');
const { EntradaEncerradaError } = require('./entrada');

const errosConhecidos = ['ValidationError', 'NotFoundError', 'ConflictError', 'DatabaseError'];

const errosDeComunicacao = [
  'MongoServerSelectionError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoNotConnectedError',
  'MongoTopologyClosedError',
];

async function executar(operacao, fn) {
  try {
    await fn();
  } catch (erro) {
    if (erro instanceof EntradaEncerradaError) {
      throw erro;
    }
    Logger.erro(erro, operacao);
    if (errosConhecidos.includes(erro.name)) {
      console.log(`\n⚠️  ${erro.message}`);
    } else if (errosDeComunicacao.includes(erro.name)) {
      console.log('\n⚠️  Falha de comunicação com o banco de dados. Verifique se o MongoDB está em execução e tente novamente.');
    } else {
      console.log('\n❌ Erro inesperado. Detalhes registrados em logs/erros.log');
    }
  }
}

module.exports = executar;
