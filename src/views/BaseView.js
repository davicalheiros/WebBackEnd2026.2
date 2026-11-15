const { ObjectId } = require('mongodb');
const { limparTela, pausar, perguntar } = require('./terminal');

const errosConhecidos = ['ValidationError', 'NotFoundError', 'ConflictError', 'DatabaseError'];

const errosDeComunicacao = [
  'MongoServerSelectionError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoNotConnectedError',
  'MongoTopologyClosedError',
];

class BaseView {
  exibirMenu(titulo, opcoes) {
    limparTela();
    console.log(`\n=== ${titulo} ===\n`);
    for (const [tecla, texto] of opcoes) {
      if (tecla === '0') console.log('');
      console.log(`  ${tecla}. ${texto}`);
    }
    console.log('');
  }

  async lerOpcao() {
    return perguntar('Opção: ');
  }

  async opcaoInvalida() {
    console.log('\nOpção inválida.');
    await pausar();
  }

  async pausar() {
    await pausar();
  }

  pularLinha() {
    console.log('');
  }

  exibirSucesso(texto) {
    console.log(`\n✅ ${texto}`);
  }

  exibirAviso(texto) {
    console.log(`\n${texto}`);
  }

  exibirErro(erro) {
    if (errosConhecidos.includes(erro.name)) {
      console.log(`\n⚠️  ${erro.message}`);
    } else if (errosDeComunicacao.includes(erro.name)) {
      console.log('\n⚠️  Falha de comunicação com o banco de dados. Verifique se o MongoDB está em execução e tente novamente.');
    } else {
      console.log('\n❌ Erro inesperado. Detalhes registrados em logs/erros.log');
    }
  }

  formatarPreco(valor) {
    if (!Number.isFinite(valor)) return valor;
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/g, ' ');
  }

  exibirTabela(itens, colunas, { comId = false } = {}) {
    if (itens.length === 0) {
      console.log('Nenhum registro encontrado.');
      return;
    }
    this.exibirNumerada(itens, comId ? ['id', ...colunas] : colunas);
  }

  exibirNumerada(itens, colunas) {
    const linhas = {};
    itens.forEach((item, indice) => {
      const linha = {};
      for (const coluna of colunas) {
        const valor = item[coluna];
        if (valor instanceof ObjectId) {
          linha[coluna] = String(valor);
        } else if (coluna === 'preco') {
          linha[coluna] = this.formatarPreco(valor);
        } else {
          linha[coluna] = valor;
        }
      }
      linhas[indice + 1] = linha;
    });
    console.table(linhas);
  }

  async escolherNaLista(itens, colunas, titulo, opcional) {
    console.log(`${titulo}:`);
    this.exibirNumerada(itens, colunas);
    const dica = opcional ? 'Enter para manter' : 'ou cole o id';
    return perguntar(`Escolha pelo número (${dica}): `);
  }
}

module.exports = BaseView;
