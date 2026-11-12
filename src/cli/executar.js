const Logger = require('../utils/Logger');
const { EntradaEncerradaError } = require('./entrada');

const errosConhecidos = ['ValidationError', 'NotFoundError', 'ConflictError', 'DatabaseError'];

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
    } else {
      console.log('\n❌ Erro inesperado. Detalhes registrados em logs/erros.log');
    }
  }
}

module.exports = executar;
