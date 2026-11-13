const Categoria = require('../models/Categoria');
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

const colunas = ['nome', 'descricao'];

async function menuCategorias() {
  while (true) {
    exibirMenu('CATEGORIAS', [
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
        await executar('Consultar categoria', async () => {
          const categoria = await escolher(Categoria, colunas, 'Categorias');
          exibirTabela([categoria], colunas);
        });
        break;
      case '4':
        await executar('Atualizar categoria', async () => {
          const categoria = await escolher(Categoria, colunas, 'Categorias');
          console.log('Deixe em branco para manter o valor atual.\n');
          const dados = soPreenchidos({
            nome: await perguntarOpcional(`Nome [${categoria.nome}]: `),
            descricao: await perguntarOpcional(`Descrição [${categoria.descricao || 'vazio'}]: `),
          });
          await Categoria.atualizar(categoria._id, dados);
          console.log('\n✅ Categoria atualizada');
        });
        break;
      case '5':
        await executar('Excluir categoria', async () => {
          const categoria = await escolher(Categoria, colunas, 'Categorias');
          if (await confirmar(`Confirma a exclusão de "${categoria.nome}"?`)) {
            await Categoria.excluir(categoria._id);
            console.log('\n✅ Categoria excluída');
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

module.exports = menuCategorias;
