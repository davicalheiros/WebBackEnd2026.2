const BaseView = require('./BaseView');

// View do menu principal e das mensagens de inicialização e encerramento.
class PrincipalView extends BaseView {
  mostrarMenu() {
    this.exibirMenu('E-COMMERCE', [
      ['1', 'Categorias'],
      ['2', 'Vendedores'],
      ['3', 'Produtos'],
      ['0', 'Sair'],
    ]);
  }

  exibirFalhaInicializacao(erro) {
    console.log(`Não foi possível iniciar: ${erro.message}`);
    console.log('Verifique se o MongoDB está em execução (veja o README).');
  }

  exibirEncerrando() {
    console.log('\nEncerrando...');
  }

  exibirErroInesperado() {
    console.log('\n❌ Erro inesperado. Detalhes registrados em logs/erros.log');
  }

  exibirDespedida() {
    console.log('Até logo!');
  }
}

module.exports = PrincipalView;
