const { conectar, desconectar } = require('./config/database');
const Logger = require('./utils/Logger');
const Categoria = require('./models/Categoria');
const Vendedor = require('./models/Vendedor');
const Produto = require('./models/Produto');
const { rl, perguntar, EntradaEncerradaError } = require('./cli/entrada');
const menuCategorias = require('./cli/menuCategorias');
const menuVendedores = require('./cli/menuVendedores');
const menuProdutos = require('./cli/menuProdutos');

async function menuPrincipal() {
  while (true) {
    console.log('\n=== E-COMMERCE ===');
    console.log('1. Categorias   2. Vendedores   3. Produtos   0. Sair');
    const opcao = await perguntar('Opção: ');

    switch (opcao) {
      case '1':
        await menuCategorias();
        break;
      case '2':
        await menuVendedores();
        break;
      case '3':
        await menuProdutos();
        break;
      case '0':
        return;
      default:
        console.log('Opção inválida.');
    }
  }
}

// Ctrl+C: fecha a entrada e a conexão e sai sem mostrar erro
let encerrando = false;
async function encerrar() {
  if (encerrando) return;
  encerrando = true;
  console.log('\nEncerrando...');
  rl.close();
  await desconectar();
  process.exit(0);
}
rl.on('SIGINT', encerrar);
process.on('SIGINT', encerrar);

async function main() {
  try {
    await conectar();
    await Promise.all([Categoria.criarIndices(), Vendedor.criarIndices(), Produto.criarIndices()]);
  } catch (erro) {
    Logger.erro(erro, 'Inicializar aplicação');
    console.log(`Não foi possível iniciar: ${erro.message}`);
    console.log('Verifique se o MongoDB está em execução (veja o README).');
    rl.close();
    await desconectar();
    process.exitCode = 1;
    return;
  }

  try {
    await menuPrincipal();
  } catch (erro) {
    // Entrada encerrada (Ctrl+D ou fim do pipe) não é falha
    if (!(erro instanceof EntradaEncerradaError)) {
      Logger.erro(erro, 'Menu principal');
      console.log('\n❌ Erro inesperado. Detalhes registrados em logs/erros.log');
      process.exitCode = 1;
    }
  } finally {
    rl.close();
    await desconectar();
    console.log('Até logo!');
  }
}

main();
