# WebBackEnd2026.2

Back-end de e-commerce em Node.js com MongoDB (driver oficial `mongodb`), com menu no terminal.
Projeto 1 da disciplina de Programação Web Back-End (UTFPR).

## Requisitos

- Node.js 20.19 ou superior
- MongoDB em execução em `mongodb://127.0.0.1:27017`

## Configuração do MongoDB

**macOS (Homebrew)**

    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community

**Linux e Windows**: siga o guia oficial de instalação da edição Community
(https://www.mongodb.com/docs/manual/administration/install-community/). No Windows, marque a opção
para instalar como serviço; no Linux, inicie com `sudo systemctl start mongod`.

**Docker (qualquer sistema)**

    docker run -d --name mongo -p 27017:27017 mongo:7

O banco `ecommerce` e as coleções são criados automaticamente na primeira execução.
Para usar outro endereço ou outro banco, defina `MONGODB_URI` e `MONGODB_DB`.

## Como executar

    git clone https://github.com/davicalheiros/WebBackEnd2026.2.git
    cd WebBackEnd2026.2
    npm install
    npm start

Outros comandos:

- `npm run popular`: insere dados de exemplo (use `npm run popular -- --limpar` para substituir os existentes)
- `npm test`: executa os testes (usa o banco separado `ecommerce_teste`)

## Funcionalidades

- CRUD de Categorias, Vendedores e Produtos
- Buscas de produtos por rótulo, categoria, vendedor e faixa de preço
- Validação dos campos obrigatórios
- Nome de categoria e email de vendedor únicos
- Categoria ou vendedor com produtos vinculados não pode ser excluído
- Erros personalizados e registro dos erros em `logs/erros.log`

## Estrutura

O projeto segue o padrão MVC: Model (`models/` e `dao/`), View (`views/`) e Controller (`controllers/`).

    src/
      index.js       ponto de entrada
      config/        conexão com o MongoDB
      models/        Model: entidades (Categoria, Vendedor e Produto)
      dao/           Model: acesso aos dados (operações no MongoDB)
      views/         View: menus, tabelas e leitura de dados no terminal
      controllers/   Controller: fluxo das operações entre View e DAO
      errors/        erros personalizados
      utils/         Logger (arquivo de log)
