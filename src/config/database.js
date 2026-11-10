const { MongoClient } = require('mongodb');
const Logger = require('../utils/Logger');

const url = 'mongodb://127.0.0.1:27017';
const nomeBanco = 'ecommerce';

const client = new MongoClient(url);
let db = null;

async function conectar() {
  if (db) {
    return db;
  }

  try {
    await client.connect();
    db = client.db(nomeBanco);
    return db;
  } catch (erro) {
    Logger.erro(erro, 'Conectar ao MongoDB');
    throw erro;
  }
}

async function desconectar() {
  await client.close();
  db = null;
}

module.exports = { conectar, desconectar };