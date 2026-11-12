const Vendedor = require('../models/Vendedor');
const executar = require('./executar');
const {
  perguntar,
  perguntarOpcional,
  confirmar,
  exibirTabela,
  soPreenchidos,
} = require('./entrada');

const colunas = ['nome', 'email'];

async function menuVendedores() {
  while (true) {
    console.log('\n=== VENDEDORES ===');
    console.log('1. Cadastrar   2. Listar   3. Buscar por id   4. Atualizar   5. Excluir   0. Voltar');
    const opcao = await perguntar('Opção: ');

    switch (opcao) {
      case '1':
        await executar('Inserir vendedor', async () => {
          const nome = await perguntar('Nome: ');
          const email = await perguntar('Email: ');
          const id = await new Vendedor(nome, email).inserir();
          console.log(`\n✅ Vendedor cadastrado com id ${id}`);
        });
        break;
      case '2':
        await executar('Listar vendedores', async () => {
          exibirTabela(await Vendedor.listarTodos(), colunas);
        });
        break;
      case '3':
        await executar('Buscar vendedor por id', async () => {
          const id = await perguntar('Id: ');
          exibirTabela([await Vendedor.buscarPorId(id)], colunas);
        });
        break;
      case '4':
        await executar('Atualizar vendedor', async () => {
          const id = await perguntar('Id: ');
          exibirTabela([await Vendedor.buscarPorId(id)], colunas);
          console.log('Deixe em branco para manter o valor atual.');
          const dados = soPreenchidos({
            nome: await perguntarOpcional('Novo nome: '),
            email: await perguntarOpcional('Novo email: '),
          });
          await Vendedor.atualizar(id, dados);
          console.log('\n✅ Vendedor atualizado');
        });
        break;
      case '5':
        await executar('Excluir vendedor', async () => {
          const id = await perguntar('Id: ');
          if (await confirmar('Confirma a exclusão?')) {
            await Vendedor.excluir(id);
            console.log('\n✅ Vendedor excluído');
          } else {
            console.log('Exclusão cancelada.');
          }
        });
        break;
      case '0':
        return;
      default:
        console.log('Opção inválida.');
    }
  }
}

module.exports = menuVendedores;
