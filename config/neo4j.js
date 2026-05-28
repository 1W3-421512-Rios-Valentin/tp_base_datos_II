const neo4j = require('neo4j-driver');

let driver;

function getDriver() {
  if (!driver) {
    throw new Error('Neo4j driver not initialized. Call initNeo4j() first.');
  }
  return driver;
}

async function initNeo4j() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    throw new Error('Faltan NEO4J_URI, NEO4J_USER o NEO4J_PASSWORD en .env');
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  await driver.verifyConnectivity();
  console.log('Neo4j AuraDB connected');

  await createConstraints();
}

async function createConstraints() {
  const session = driver.session();
  try {
    await session.run('CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.userId IS UNIQUE');
    await session.run('CREATE CONSTRAINT subject_name IF NOT EXISTS FOR (s:Subject) REQUIRE s.name IS UNIQUE');
    await session.run('CREATE CONSTRAINT language_code IF NOT EXISTS FOR (l:Language) REQUIRE l.code IS UNIQUE');
  } finally {
    await session.close();
  }
}

async function closeNeo4j() {
  if (driver) await driver.close();
}

module.exports = { initNeo4j, getDriver, closeNeo4j };
