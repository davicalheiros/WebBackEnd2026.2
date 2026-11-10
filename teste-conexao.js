const { conectar, desconectar } = require('./src/config/database');

async function testar() {
  try {
    const db = await conectar();
    console.log('[OK] Conectado ao banco:', db.databaseName);
  } catch (erro) {
    console.log('[ERRO] Falha na conexao:', erro.message);
  } finally {
    await desconectar();
  }
}

testar();