const BaseController = require('./BaseController');
const PrincipalView = require('../views/PrincipalView');
const CategoriaController = require('./CategoriaController');
const VendedorController = require('./VendedorController');
const ProdutoController = require('./ProdutoController');

class PrincipalController extends BaseController {
  constructor() {
    super(new PrincipalView());
    this.categorias = new CategoriaController();
    this.vendedores = new VendedorController();
    this.produtos = new ProdutoController();
  }

  async iniciar() {
    while (true) {
      this.view.mostrarMenu();
      const opcao = await this.view.lerOpcao();

      switch (opcao) {
        case '1':
          await this.categorias.iniciar();
          break;
        case '2':
          await this.vendedores.iniciar();
          break;
        case '3':
          await this.produtos.iniciar();
          break;
        case '0':
          return;
        default:
          await this.view.opcaoInvalida();
      }
    }
  }
}

module.exports = PrincipalController;
