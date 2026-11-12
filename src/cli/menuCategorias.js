const Categoria = require('../models/Categoria');
const executar = require('./executar');
const {
  perguntar,
  perguntarOpcional,
  confirmar,
  exibirTabela,
  soPreenchidos,
} = require('./entrada');

const colunas = ['nome', 'descricao'];

async function menuCategorias() {
  while (true) {
    console.log('\n=== CATEGORIAS ===');
    console.log('1. Cadastrar   2. Listar   3. Buscar por id   4. Atualizar   5. Excluir   0. Voltar');
    const opcao = await perguntar('Opção: ');

    switch (opcao) {
      case '1':
        await executar('Inserir categoria', async () => {
          const nome = await perguntar('Nome: ');
          const descricao = await perguntar('Descrição (opcional): ');
          const id = await new Categoria(nome, descricao).inserir();
          console.log(`\n✅ Categoria cadastrada com id ${id}`);
        });
        break;
      case '2':
        await executar('Listar categorias', async () => {
          exibirTabela(await Categoria.listarTodos(), colunas);
        });
        break;
      case '3':
        await executar('Buscar categoria por id', async () => {
          const id = await perguntar('Id: ');
          exibirTabela([await Categoria.buscarPorId(id)], colunas);
        });
        break;
      case '4':
        await executar('Atualizar categoria', async () => {
          const id = await perguntar('Id: ');
          exibirTabela([await Categoria.buscarPorId(id)], colunas);
          console.log('Deixe em branco para manter o valor atual.');
          const dados = soPreenchidos({
            nome: await perguntarOpcional('Novo nome: '),
            descricao: await perguntarOpcional('Nova descrição: '),
          });
          await Categoria.atualizar(id, dados);
          console.log('\n✅ Categoria atualizada');
        });
        break;
      case '5':
        await executar('Excluir categoria', async () => {
          const id = await perguntar('Id: ');
          if (await confirmar('Confirma a exclusão?')) {
            await Categoria.excluir(id);
            console.log('\n✅ Categoria excluída');
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

module.exports = menuCategorias;
