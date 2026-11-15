const { conectar, desconectar } = require('./config/database');
const Logger = require('./utils/Logger');
const CategoriaDAO = require('./dao/CategoriaDAO');
const VendedorDAO = require('./dao/VendedorDAO');
const ProdutoDAO = require('./dao/ProdutoDAO');
const PrincipalController = require('./controllers/PrincipalController');
const { rl } = require('./views/terminal');
const EntradaEncerradaError = require('./errors/EntradaEncerradaError');

const controller = new PrincipalController();
const view = controller.view;

// Ctrl+C fecha a entrada e a conexão antes de sair.
let encerrando = false;
async function encerrar() {
  if (encerrando) return;
  encerrando = true;
  view.exibirEncerrando();
  rl.close();
  await desconectar();
  process.exit(0);
}
rl.on('SIGINT', encerrar);
process.on('SIGINT', encerrar);

// Falha ao conectar encerra com aviso; fim da entrada não é erro.
async function main() {
  try {
    await conectar();
    await Promise.all([
      new CategoriaDAO().criarIndices(),
      new VendedorDAO().criarIndices(),
      new ProdutoDAO().criarIndices(),
    ]);
  } catch (erro) {
    Logger.erro(erro, 'Inicializar aplicação');
    view.exibirFalhaInicializacao(erro);
    rl.close();
    await desconectar();
    process.exitCode = 1;
    return;
  }

  try {
    await controller.iniciar();
  } catch (erro) {
    if (!(erro instanceof EntradaEncerradaError)) {
      Logger.erro(erro, 'Menu principal');
      view.exibirErroInesperado();
      process.exitCode = 1;
    }
  } finally {
    rl.close();
    await desconectar();
    view.exibirDespedida();
  }
}

main();
