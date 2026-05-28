const { getDriver } = require('../config/neo4j');

// roomId determinístico: IDs ordenados separados por _
function getRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

// Verifica que dos usuarios tienen match en Neo4j
async function areMatched(userId1, userId2) {
  const session = getDriver().session();
  try {
    const result = await session.run(
      `MATCH (a:User {userId: $u1})-[:MATCHED]-(b:User {userId: $u2}) RETURN a LIMIT 1`,
      { u1: userId1, u2: userId2 }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
}

module.exports = { getRoomId, areMatched };
