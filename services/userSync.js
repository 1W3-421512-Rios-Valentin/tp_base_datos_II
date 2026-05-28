const { getDriver } = require('../config/neo4j');

async function syncUserToNeo4j(user) {
  const driver = getDriver();
  const session = driver.session();
  try {
    await session.run(
      `MERGE (u:User {userId: $userId})
       SET u.username = $username,
           u.studyYear = $studyYear,
           u.lat = $lat,
           u.lon = $lon`,
      {
        userId: user._id.toString(),
        username: user.username,
        studyYear: user.studyYear || '',
        lat: user.location?.lat ?? null,
        lon: user.location?.lon ?? null,
      }
    );

    // Limpiar relaciones anteriores para re-crearlas
    await session.run(
      `MATCH (u:User {userId: $userId})-[r:STUDIES|SPEAKS]->() DELETE r`,
      { userId: user._id.toString() }
    );

    for (const subject of (user.subjects || [])) {
      await session.run(
        `MERGE (s:Subject {name: $name})
         WITH s
         MATCH (u:User {userId: $userId})
         MERGE (u)-[:STUDIES]->(s)`,
        { name: subject, userId: user._id.toString() }
      );
    }

    for (const lang of (user.languages || [])) {
      await session.run(
        `MERGE (l:Language {code: $code})
         WITH l
         MATCH (u:User {userId: $userId})
         MERGE (u)-[:SPEAKS]->(l)`,
        { code: lang, userId: user._id.toString() }
      );
    }
  } finally {
    await session.close();
  }
}

module.exports = { syncUserToNeo4j };
