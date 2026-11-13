const { conectar, desconectar } = require('./src/config/database');
const Categoria = require('./src/models/Categoria');
const Vendedor = require('./src/models/Vendedor');
const Produto = require('./src/models/Produto');

const categorias = [
  ['Eletrônicos', 'Celulares, fones e acessórios'],
  ['Informática', 'Computadores, periféricos e componentes'],
  ['Casa e Cozinha', 'Utensílios e eletroportáteis'],
  ['Livros', 'Livros físicos e e-books'],
  ['Esporte e Lazer', 'Artigos esportivos e para atividades ao ar livre'],
];

const vendedores = [
  ['Ana Souza', 'ana.souza@loja.com'],
  ['Bruno Lima', 'bruno.lima@loja.com'],
  ['Carla Mendes', 'carla.mendes@loja.com'],
  ['Diego Rocha', 'diego.rocha@loja.com'],
];

const produtos = [
  ['Fone Bluetooth', 199.9, 25, 'Eletrônicos', 'Ana Souza', 'Fone sem fio com cancelamento de ruído'],
  ['Carregador Turbo 30W', 89.9, 40, 'Eletrônicos', 'Ana Souza', ''],
  ['Smartphone 128GB', 1899, 8, 'Eletrônicos', 'Bruno Lima', 'Tela de 6,5 polegadas'],
  ['Caixa de Som Portátil', 249.5, 0, 'Eletrônicos', 'Carla Mendes', 'Produto sem estoque, para testes'],
  ['Mouse sem Fio', 59.9, 60, 'Informática', 'Bruno Lima', ''],
  ['Teclado Mecânico', 349, 15, 'Informática', 'Bruno Lima', 'Switches azuis'],
  ['Monitor 24 polegadas', 899.99, 5, 'Informática', 'Diego Rocha', 'Full HD, 75Hz'],
  ['Cabo HDMI 2m', 29.9, 100, 'Informática', 'Diego Rocha', ''],
  ['Air Fryer 4L', 429.9, 12, 'Casa e Cozinha', 'Carla Mendes', ''],
  ['Jogo de Panelas Inox', 599, 7, 'Casa e Cozinha', 'Carla Mendes', '5 peças'],
  ['Cafeteira Elétrica', 159.9, 20, 'Casa e Cozinha', 'Ana Souza', ''],
  ['Livro: Lógica de Programação', 79.9, 30, 'Livros', 'Diego Rocha', ''],
  ['Livro: C++ para Iniciantes', 119, 10, 'Livros', 'Diego Rocha', 'Útil para testar a busca por "C++"'],
  ['Bola de Futebol', 129.9, 18, 'Esporte e Lazer', 'Bruno Lima', ''],
  ['Garrafa Térmica 1L', 69.9, 45, 'Esporte e Lazer', 'Ana Souza', ''],
];

async function bancoTemDados(db) {
  for (const nome of ['categorias', 'vendedores', 'produtos']) {
    if ((await db.collection(nome).countDocuments()) > 0) return true;
  }
  return false;
}

async function popular() {
  const limpar = process.argv.includes('--limpar');
  const db = await conectar();

  if (await bancoTemDados(db)) {
    if (!limpar) {
      console.log(`O banco "${db.databaseName}" já possui dados. Nada foi alterado.`);
      console.log('Para apagar tudo e popular de novo, rode: npm run popular -- --limpar');
      process.exitCode = 1;
      return;
    }
    await Promise.all(['categorias', 'vendedores', 'produtos'].map((nome) => db.collection(nome).deleteMany({})));
    console.log(`Dados anteriores do banco "${db.databaseName}" apagados.`);
  }

  await Promise.all([Categoria.criarIndices(), Vendedor.criarIndices(), Produto.criarIndices()]);

  const idsCategorias = {};
  for (const [nome, descricao] of categorias) {
    idsCategorias[nome] = await new Categoria(nome, descricao).inserir();
  }

  const idsVendedores = {};
  for (const [nome, email] of vendedores) {
    idsVendedores[nome] = await new Vendedor(nome, email).inserir();
  }

  for (const [rotulo, preco, estoque, categoria, vendedor, descricao] of produtos) {
    await new Produto(rotulo, preco, estoque, idsCategorias[categoria], idsVendedores[vendedor], descricao).inserir();
  }

  console.log(`Banco "${db.databaseName}" populado com sucesso:`);
  console.log(`  ${categorias.length} categorias`);
  console.log(`  ${vendedores.length} vendedores`);
  console.log(`  ${produtos.length} produtos`);
}

popular()
  .catch((erro) => {
    console.log(`Não foi possível popular o banco: ${erro.message}`);
    process.exitCode = 1;
  })
  .finally(() => desconectar());
