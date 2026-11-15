const Vendedor = require('../models/Vendedor');
const VendedorDAO = require('../dao/VendedorDAO');
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

const vendedorDAO = new VendedorDAO();

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
          const id = await vendedorDAO.inserir(new Vendedor(nome, email));
          console.log(`\n✅ Vendedor cadastrado com id ${id}`);
        });
        break;
      case '2':
        await executar('Listar vendedores', async () => {
          exibirTabela(await vendedorDAO.listarTodos(), colunas);
        });
        break;
      case '3':
        await executar('Consultar vendedor', async () => {
          const vendedor = await escolher(vendedorDAO, colunas, 'Vendedores');
          exibirTabela([vendedor], colunas, { comId: true });
        });
        break;
      case '4':
        await executar('Atualizar vendedor', async () => {
          const vendedor = await escolher(vendedorDAO, colunas, 'Vendedores');
          console.log('Deixe em branco para manter o valor atual.\n');
          const dados = soPreenchidos({
            nome: await perguntarOpcional(`Nome [${vendedor.nome}]: `),
            email: await perguntarOpcional(`Email [${vendedor.email}]: `),
          });
          await vendedorDAO.atualizar(vendedor.id, dados);
          console.log('\n✅ Vendedor atualizado');
        });
        break;
      case '5':
        await executar('Excluir vendedor', async () => {
          const vendedor = await escolher(vendedorDAO, colunas, 'Vendedores');
          if (await confirmar(`Confirma a exclusão de "${vendedor.nome}"?`)) {
            await vendedorDAO.excluir(vendedor.id);
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
