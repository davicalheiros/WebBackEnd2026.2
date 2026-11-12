const fs = require('fs');
const path = require('path');

const pastaLogs = path.join(__dirname, '..', '..', 'logs');
const arquivoLog = path.join(pastaLogs, 'erros.log');

class Logger {
  static erro(erro, operacao) {
    fs.mkdirSync(pastaLogs, { recursive: true });

    const dataHora = new Date().toLocaleString('pt-BR').replace(',', '');

    let registro =
      `[${dataHora}]\n` +
      `ERRO: ${erro.name}\n` +
      `MENSAGEM: ${erro.message}\n`;

    if (erro.campo) registro += `CAMPO: ${erro.campo}\n`;
    if (erro.entidade) registro += `ENTIDADE: ${erro.entidade}\n`;
    if (erro.causa) registro += `CAUSA: ${erro.causa.message}\n`;

    registro += `OPERACAO: ${operacao}\n\n`;

    fs.appendFileSync(arquivoLog, registro);
  }
}

module.exports = Logger;
