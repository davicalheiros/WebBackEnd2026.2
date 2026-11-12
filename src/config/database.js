const { MongoClient } = require('mongodb');
const DatabaseError = require('../errors/DatabaseError');

const url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const nomeBanco = process.env.MONGODB_DB || 'ecommerce';

// Sem o timeout, com o MongoDB desligado o programa trava ~30 s antes de falhar
const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });
let db = null;

async function conectar() {
  if (db) {
    return db;
  }

  try {
    await client.connect();
  } catch (erro) {
    throw new DatabaseError(`Não foi possível conectar ao MongoDB em ${url}`, erro);
  }

  db = client.db(nomeBanco);
  return db;
}

async function desconectar() {
  await client.close();
  db = null;
}

module.exports = { conectar, desconectar };
