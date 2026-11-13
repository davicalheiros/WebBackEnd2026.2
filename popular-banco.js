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
  ['Moda', 'Roupas, calçados e acessórios'],
  ['Beleza e Cuidados', 'Cosméticos e higiene pessoal'],
  ['Brinquedos', 'Jogos e brinquedos para todas as idades'],
  ['Pet Shop', 'Rações e acessórios para animais'],
  ['Papelaria', 'Categoria sem produtos, para testar a exclusão'],
];

const vendedores = [
  ['Ana Souza', 'ana.souza@loja.com'],
  ['Bruno Lima', 'bruno.lima@loja.com'],
  ['Carla Mendes', 'carla.mendes@loja.com'],
  ['Diego Rocha', 'diego.rocha@loja.com'],
  ['Eduarda Alves', 'eduarda.alves@loja.com'],
  ['Felipe Costa', 'felipe.costa@loja.com'],
  ['Gabriela Nunes', 'gabriela.nunes@loja.com'],
  ['Henrique Barros', 'henrique.barros@loja.com'],
  ['Isabela Freitas', 'isabela.freitas@loja.com'],
  ['João Pereira', 'joao.pereira@loja.com'],
];

const produtos = [
  ['Fone Bluetooth', 199.9, 25, 'Eletrônicos', 'Ana Souza', 'Fone sem fio com cancelamento de ruído'],
  ['Carregador Turbo 30W', 89.9, 40, 'Eletrônicos', 'Ana Souza', ''],
  ['Smartphone 128GB', 1899, 8, 'Eletrônicos', 'Bruno Lima', 'Tela de 6,5 polegadas'],
  ['Caixa de Som Portátil', 249.5, 0, 'Eletrônicos', 'Carla Mendes', 'Sem estoque'],
  ['Smartwatch Esportivo', 699, 14, 'Eletrônicos', 'Felipe Costa', 'Monitor cardíaco e GPS'],
  ['Power Bank 10000mAh', 129.9, 33, 'Eletrônicos', 'Ana Souza', ''],
  ['Fone com Fio P2', 39.9, 80, 'Eletrônicos', 'Gabriela Nunes', ''],
  ['Tablet 10 polegadas', 1299, 6, 'Eletrônicos', 'Bruno Lima', ''],

  ['Mouse sem Fio', 59.9, 60, 'Informática', 'Bruno Lima', ''],
  ['Teclado Mecânico', 349, 15, 'Informática', 'Bruno Lima', 'Switches azuis'],
  ['Monitor 24 polegadas', 899.99, 5, 'Informática', 'Diego Rocha', 'Full HD, 75Hz'],
  ['Cabo HDMI 2m', 29.9, 100, 'Informática', 'Diego Rocha', ''],
  ['Notebook 15 polegadas', 3499, 4, 'Informática', 'Felipe Costa', '16GB de RAM, SSD de 512GB'],
  ['SSD 1TB', 449.9, 22, 'Informática', 'Diego Rocha', ''],
  ['Webcam Full HD', 189, 0, 'Informática', 'Henrique Barros', 'Sem estoque'],
  ['Hub USB-C 7 em 1', 159.9, 27, 'Informática', 'Felipe Costa', ''],

  ['Air Fryer 4L', 429.9, 12, 'Casa e Cozinha', 'Carla Mendes', ''],
  ['Jogo de Panelas Inox', 599, 7, 'Casa e Cozinha', 'Carla Mendes', '5 peças'],
  ['Cafeteira Elétrica', 159.9, 20, 'Casa e Cozinha', 'Ana Souza', ''],
  ['Liquidificador 1200W', 219.9, 16, 'Casa e Cozinha', 'Eduarda Alves', ''],
  ['Jogo de Facas 6 peças', 139.9, 24, 'Casa e Cozinha', 'Eduarda Alves', ''],
  ['Panela de Pressão 4,5L', 189.9, 11, 'Casa e Cozinha', 'Carla Mendes', ''],
  ['Garrafa de Café 1L', 49.9, 50, 'Casa e Cozinha', 'Isabela Freitas', ''],

  ['Livro: Lógica de Programação', 79.9, 30, 'Livros', 'Diego Rocha', ''],
  ['Livro: C++ para Iniciantes', 119, 10, 'Livros', 'Diego Rocha', 'Útil para testar a busca por "C++"'],
  ['Livro: JavaScript Moderno', 99.9, 18, 'Livros', 'Henrique Barros', ''],
  ['Livro: Banco de Dados NoSQL', 109.9, 9, 'Livros', 'Henrique Barros', ''],
  ['Livro: Dom Casmurro', 34.9, 40, 'Livros', 'Isabela Freitas', 'Edição de bolso'],
  ['Livro: O Pequeno Príncipe', 29.9, 55, 'Livros', 'Isabela Freitas', ''],
  ['Livro: Algoritmos (C)', 149, 0, 'Livros', 'Diego Rocha', 'Sem estoque; parênteses no rótulo'],

  ['Bola de Futebol', 129.9, 18, 'Esporte e Lazer', 'Bruno Lima', ''],
  ['Garrafa Térmica 1L', 69.9, 45, 'Esporte e Lazer', 'Ana Souza', ''],
  ['Tapete de Yoga', 89.9, 21, 'Esporte e Lazer', 'Gabriela Nunes', ''],
  ['Halteres 2kg (par)', 79.9, 30, 'Esporte e Lazer', 'Felipe Costa', ''],
  ['Barraca para 4 Pessoas', 549, 3, 'Esporte e Lazer', 'Felipe Costa', ''],
  ['Bicicleta Aro 29', 1599, 2, 'Esporte e Lazer', 'Henrique Barros', '21 marchas'],

  ['Camiseta Básica', 49.9, 120, 'Moda', 'Gabriela Nunes', '100% algodão'],
  ['Calça Jeans', 159.9, 35, 'Moda', 'Gabriela Nunes', ''],
  ['Tênis de Corrida', 349.9, 19, 'Moda', 'Felipe Costa', ''],
  ['Jaqueta Corta-Vento', 199.9, 0, 'Moda', 'Eduarda Alves', 'Sem estoque'],
  ['Boné Aba Curva', 59.9, 48, 'Moda', 'Gabriela Nunes', ''],
  ['Mochila Executiva', 229, 13, 'Moda', 'Isabela Freitas', 'Compartimento para notebook'],
  ['Meia Esportiva (3 pares)', 39.9, 64, 'Moda', 'Felipe Costa', ''],

  ['Protetor Solar FPS 50', 64.9, 70, 'Beleza e Cuidados', 'Eduarda Alves', ''],
  ['Shampoo 400ml', 27.9, 90, 'Beleza e Cuidados', 'Eduarda Alves', ''],
  ['Secador de Cabelo', 179.9, 10, 'Beleza e Cuidados', 'Carla Mendes', ''],
  ['Kit Barbear', 119.9, 15, 'Beleza e Cuidados', 'Henrique Barros', ''],
  ['Perfume 100ml', 289, 8, 'Beleza e Cuidados', 'Isabela Freitas', ''],

  ['Quebra-Cabeça 1000 peças', 89.9, 17, 'Brinquedos', 'Isabela Freitas', ''],
  ['Blocos de Montar 500 peças', 249.9, 9, 'Brinquedos', 'Gabriela Nunes', ''],
  ['Carrinho de Controle Remoto', 199, 0, 'Brinquedos', 'Bruno Lima', 'Sem estoque'],
  ['Jogo de Tabuleiro', 149.9, 12, 'Brinquedos', 'Eduarda Alves', ''],
  ['Boneca Articulada', 99.9, 20, 'Brinquedos', 'Gabriela Nunes', ''],

  ['Ração para Cães 15kg', 219.9, 25, 'Pet Shop', 'Henrique Barros', ''],
  ['Ração para Gatos 10kg', 189.9, 18, 'Pet Shop', 'Henrique Barros', ''],
  ['Arranhador para Gatos', 129.9, 7, 'Pet Shop', 'Eduarda Alves', ''],
  ['Coleira Ajustável', 29.9, 60, 'Pet Shop', 'Carla Mendes', ''],
  ['Cama para Cachorro', 159.9, 0, 'Pet Shop', 'Eduarda Alves', 'Sem estoque'],
  ['Comedouro Duplo', 44.9, 33, 'Pet Shop', 'Ana Souza', ''],
  ['Brinquedo Mordedor', 19.9, 75, 'Pet Shop', 'Ana Souza', ''],
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
