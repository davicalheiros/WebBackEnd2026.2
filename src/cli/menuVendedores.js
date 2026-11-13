const Vendedor = require('../models/Vendedor');
const executar = require('./executar');
const {
  exibirMenu,
  escolher,
  pausar,
  perguntar,
  perguntarOpcional,
  confirmar,
  exibirTabela,
  soPreenchidos,
} = require('./entrada');

const colunas = ['nome', 'email'];

async function menuVendedores() {
  while (true) {
    exibirMenu('VENDEDORES', [
      ['1', 'Cadastrar'],
      ['2', 'Listar'],
      ['3', 'Consultar'],
      ['4', 'Atualizar'],
      ['5', 'Excluir'],
      ['0', 'Voltar'],
    ]);
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
        await executar('Consultar vendedor', async () => {
          const vendedor = await escolher(Vendedor, colunas, 'Vendedores');
          exibirTabela([vendedor], colunas, { comId: true });
        });
        break;
      case '4':
        await executar('Atualizar vendedor', async () => {
          const vendedor = await escolher(Vendedor, colunas, 'Vendedores');
          console.log('Deixe em branco para manter o valor atual.\n');
          const dados = soPreenchidos({
            nome: await perguntarOpcional(`Nome [${vendedor.nome}]: `),
            email: await perguntarOpcional(`Email [${vendedor.email}]: `),
          });
          await Vendedor.atualizar(vendedor._id, dados);
          console.log('\n✅ Vendedor atualizado');
        });
        break;
      case '5':
        await executar('Excluir vendedor', async () => {
          const vendedor = await escolher(Vendedor, colunas, 'Vendedores');
          if (await confirmar(`Confirma a exclusão de "${vendedor.nome}"?`)) {
            await Vendedor.excluir(vendedor._id);
            console.log('\n✅ Vendedor excluído');
          } else {
            console.log('\nExclusão cancelada.');
          }
        });
        break;
      case '0':
        return;
      default:
        console.log('\nOpção inválida.');
        await pausar();
    }
  }
}

module.exports = menuVendedores;
