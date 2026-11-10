const fs = require('fs');
const path = require('path');

const pastaLogs = path.join(__dirname, '..', '..', 'logs');
const arquivoLog = path.join(pastaLogs, 'erros.log');

class Logger {
  static erro(erro, operacao) {
    fs.mkdirSync(pastaLogs, { recursive: true });

    const dataHora = new Date().toLocaleString('pt-BR').replace(',', '');

    const registro =
      `[${dataHora}]\n` +
      `ERRO: ${erro.name}\n` +
      `MENSAGEM: ${erro.message}\n` +
      `OPERACAO: ${operacao}\n\n`;

    fs.appendFileSync(arquivoLog, registro);
  }
}

module.exports = Logger;