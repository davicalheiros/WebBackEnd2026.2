# WebBackEnd2026.2

Aplicação back-end de e-commerce em **Node.js** com **MongoDB**, usando o driver oficial `mongodb`. Projeto 1 da disciplina de Programação Web Back-End (UTFPR). A interação é feita por um menu no terminal, sem front-end.

## Sobre

O sistema gerencia três entidades, com CRUD completo (cadastrar, listar, consultar, atualizar e excluir):

- **Categoria**: agrupa os produtos.
- **Vendedor**: quem anuncia os produtos.
- **Produto**: pertence a uma Categoria e a um Vendedor. A ligação é feita por referência: o produto guarda o `_id` da categoria (`idCategoria`) e o `_id` do vendedor (`idVendedor`).

Conceitos aplicados: programação orientada a objetos (classes, herança e métodos estáticos), validação de campos obrigatórios, erros personalizados e registro de erros em arquivo de log.

## Tecnologias

- Node.js 20.19 ou superior (CommonJS)
- MongoDB (testado com a instalação local, versão Community)
- Driver oficial [`mongodb`](https://www.npmjs.com/package/mongodb)

## Configuração do MongoDB

O programa precisa de um MongoDB em execução. Por padrão, ele procura em `mongodb://127.0.0.1:27017`. O banco `ecommerce` e as coleções são criados automaticamente na primeira execução; não é preciso criar nada manualmente.

### macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew install mongosh
brew services start mongodb-community
```

Para parar: `brew services stop mongodb-community`.
Guia oficial: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/

### Linux (Ubuntu)

Siga o guia oficial, que traz os comandos para cada versão da distribuição:
https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

Depois da instalação:

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### Windows

1. Baixe o instalador MSI da edição Community em https://www.mongodb.com/try/download/community
2. Execute o instalador e mantenha marcada a opção **Install MongoDB as a Service**. Assim o MongoDB inicia sozinho com o Windows.
3. Opcionalmente, instale também o MongoDB Shell (`mongosh`): https://www.mongodb.com/try/download/shell

Guia oficial: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/

### Alternativa com Docker

Em qualquer sistema com Docker instalado:

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

Para parar e iniciar novamente: `docker stop mongo` e `docker start mongo`.

### Como verificar se está funcionando

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

A resposta deve conter `{ ok: 1 }`. Sem o `mongosh`, rode `npm start` (veja abaixo): se o MongoDB estiver fora do ar, o programa avisa em até 5 segundos.

## Instalação e execução

```bash
git clone https://github.com/davicalheiros/WebBackEnd2026.2.git
cd WebBackEnd2026.2
npm install
npm start
```

Para rodar os testes:

```bash
npm test
```

`npm test` executa duas verificações:

1. `teste-entidades.js`: valida as entidades sem usar o banco. Cada caso declara se deve ser aceito ou rejeitado; ✅ indica que o resultado foi o esperado (por exemplo, um email sem domínio foi rejeitado).
2. `teste-crud.js`: teste de integração com o MongoDB. Usa o banco separado **`ecommerce_teste`**, que é apagado no início e no fim. O banco `ecommerce` não é tocado.

## Dados de exemplo

Para testar o menu com dados prontos (10 categorias, 10 vendedores e 60 produtos):

```bash
npm run popular
```

Se o banco já tiver dados, o script não altera nada e apenas avisa. Para apagar os dados existentes e popular de novo:

```bash
npm run popular -- --limpar
```

## Variáveis de ambiente (opcionais)

| Variável | Padrão | Uso |
|---|---|---|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | Endereço do MongoDB (útil para um servidor remoto ou outra porta) |
| `MONGODB_DB` | `ecommerce` | Nome do banco de dados |

Exemplos (macOS e Linux):

```bash
MONGODB_URI=mongodb://127.0.0.1:27018 npm start
MONGODB_DB=ecommerce_demo npm start
```

No Windows (PowerShell):

```powershell
$env:MONGODB_DB="ecommerce_demo"; npm start
```

## Estrutura do projeto

```
src/
  index.js                 ponto de entrada: conecta, cria os índices, abre o menu principal
  config/
    database.js            conexão única com o MongoDB (conectar e desconectar)
  models/
    BaseModel.js           classe-mãe com o CRUD genérico
    Categoria.js           herda de BaseModel
    Vendedor.js            herda de BaseModel
    Produto.js             herda de BaseModel; relacionamentos e buscas
  errors/
    ValidationError.js     dado inválido ou ausente
    NotFoundError.js       registro inexistente
    ConflictError.js       duplicidade ou exclusão bloqueada
    DatabaseError.js       falha de conexão com o banco
  cli/
    entrada.js             leitura de texto e números, confirmação e tabelas
    executar.js            captura os erros das operações, exibe a mensagem e chama o Logger
    menuCategorias.js      menu de categorias
    menuVendedores.js      menu de vendedores
    menuProdutos.js        menu de produtos
  utils/
    Logger.js              grava os erros em logs/erros.log
logs/
  erros.log                gerado automaticamente (não vai para o Git)
teste-entidades.js         testes de validação, sem banco
teste-crud.js              testes de integração, banco ecommerce_teste
teste-conexao.js           verifica a conexão com o MongoDB
teste-logger.js            grava exemplos de erros no log
popular-banco.js           insere dados de exemplo (npm run popular)
```

Fluxo de uma operação: o menu (`cli`) lê os dados, a entidade (`models`) valida e aplica as regras, o `BaseModel` acessa o MongoDB e qualquer erro sobe até o `executar.js`, que mostra a mensagem ao usuário e registra no log.

## Regras de negócio e validações

### Categoria

| Campo | Regra |
|---|---|
| `nome` | Obrigatório, texto não vazio. Único, sem diferenciar maiúsculas de minúsculas ("Casa" e "casa" são o mesmo nome) |
| `descricao` | Opcional, texto. Padrão: vazio |

### Vendedor

| Campo | Regra |
|---|---|
| `nome` | Obrigatório, texto não vazio |
| `email` | Obrigatório, formato válido. Guardado sem espaços e em minúsculas. Único |

### Produto

| Campo | Regra |
|---|---|
| `rotulo` | Obrigatório, texto não vazio |
| `preco` | Número maior que zero |
| `estoque` | Número inteiro maior ou igual a zero |
| `idCategoria` | Obrigatório. Precisa ser um id válido de uma categoria existente |
| `idVendedor` | Obrigatório. Precisa ser um id válido de um vendedor existente |
| `descricao` | Opcional, texto. Padrão: vazio |

### Regras gerais

- Categoria ou Vendedor que possui produtos vinculados **não pode ser excluído**, porque o MongoDB não faz exclusão em cascata.
- Textos têm os espaços das pontas removidos.
- Ao atualizar, campos deixados em branco mantêm o valor atual.
- Buscas de produto: por parte do rótulo (sem diferenciar maiúsculas de minúsculas), por categoria, por vendedor e por faixa de preço.

## Tratamento de erros e log

O sistema usa quatro classes de erro personalizadas, todas derivadas de `Error`:

| Erro | Quando ocorre |
|---|---|
| `ValidationError` | Campo ausente ou inválido, id mal formado, faixa de preço incorreta |
| `NotFoundError` | O id informado não existe, ou a categoria/vendedor do produto não existe |
| `ConflictError` | Nome de categoria ou email de vendedor repetido; exclusão de categoria/vendedor com produtos |
| `DatabaseError` | Não foi possível conectar ao MongoDB |

Se o MongoDB cair com o programa aberto, o menu avisa sobre a falha de comunicação com o banco e continua funcionando.

Todo erro é registrado em `logs/erros.log` (a pasta é criada automaticamente), com data e hora, tipo, mensagem e a operação que estava sendo feita:

```
[12/11/2026 20:32:45]
ERRO: ValidationError
MENSAGEM: Campo "nome" não pode ser vazio
CAMPO: nome
OPERACAO: Inserir categoria

[12/11/2026 20:32:46]
ERRO: ConflictError
MENSAGEM: Categoria possui 1 produto(s) vinculado(s) e não pode ser excluída
CAMPO: idCategoria
OPERACAO: Excluir categoria
```

## Exemplo de uso

```
=== CATEGORIAS ===

  1. Cadastrar
  2. Listar
  3. Consultar
  4. Atualizar
  5. Excluir

  0. Voltar

Opção: 1

Nome: Eletrônicos
Descrição (opcional): Aparelhos

✅ Categoria cadastrada com id 6af64c9da9cb6ed973cccc2b

Pressione Enter para continuar...
```

Não é preciso digitar ids. Para consultar, atualizar ou excluir um registro, ou para ligar um produto à sua categoria e ao seu vendedor, o menu mostra uma lista numerada e você escolhe pelo número (colar o id também é aceito):

```
Opção: 1

Categorias:
┌─────────┬───────────────┐
│ (index) │ nome          │
├─────────┼───────────────┤
│ 1       │ 'Brinquedos'  │
│ 2       │ 'Eletrônicos' │
└─────────┴───────────────┘
Escolha pelo número (ou cole o id): 2

Vendedores:
┌─────────┬───────┬────────────────┐
│ (index) │ nome  │ email          │
├─────────┼───────┼────────────────┤
│ 1       │ 'Ana' │ 'ana@loja.com' │
└─────────┴───────┴────────────────┘
Escolha pelo número (ou cole o id): 1

Rótulo: Fone Bluetooth
Preço (R$): 19,90
Estoque: 5
Descrição (opcional):

✅ Produto cadastrado com id 6af653bfd71d64e78e69afee
```

As listagens de produtos mostram o nome da categoria e do vendedor, e não os ids. Os preços aparecem em reais (`R$ 1.299,90`), e podem ser digitados como `19,90`, `19.90`, `1.299,90` ou `R$ 1.299,90`.

A tela é limpa sempre que um menu é exibido. Depois de cada operação, o resultado fica na tela até você pressionar Enter.

Para encerrar, escolha `0` nos menus ou use `Ctrl+C`.

## Inspecionar os dados

Com o `mongosh`:

```bash
mongosh
use ecommerce
show collections
db.categorias.find()
db.vendedores.find()
db.produtos.find()
```
