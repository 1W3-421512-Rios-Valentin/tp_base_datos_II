const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDriver } = require('../config/neo4j');
const User = require('../models/User');

const SANTOKENS_PER_MATCH = parseInt(process.env.SANTOKENS_PER_MATCH) || 10;

// GET /api/matching/candidates
// Devuelve candidatos ordenados por compatibilidad (materias, año, idioma, proximidad)
router.get('/candidates', auth, async (req, res) => {
  const session = getDriver().session();
  try {
    const result = await session.run(
      `MATCH (me:User {userId: $myId})
       MATCH (other:User)
       WHERE other.userId <> $myId
         AND NOT (me)-[:SWIPED_RIGHT|SWIPED_LEFT]->(other)
         AND NOT (me)-[:MATCHED]-(other)
       OPTIONAL MATCH (me)-[:STUDIES]->(s:Subject)<-[:STUDIES]-(other)
       WITH me, other, count(s) AS sharedSubjects
       OPTIONAL MATCH (me)-[:SPEAKS]->(l:Language)<-[:SPEAKS]-(other)
       WITH me, other, sharedSubjects, count(l) AS sharedLanguages,
            CASE WHEN me.studyYear <> '' AND other.studyYear <> '' AND me.studyYear = other.studyYear
                 THEN 2 ELSE 0 END AS yearBonus,
            CASE WHEN me.lat IS NOT NULL AND other.lat IS NOT NULL
                 THEN CASE WHEN abs(me.lat - other.lat) < 0.5 AND abs(me.lon - other.lon) < 0.5
                           THEN 1 ELSE 0 END
                 ELSE 0 END AS proximityBonus
       WITH other,
            (sharedSubjects * 3 + sharedLanguages * 2 + yearBonus + proximityBonus) AS score
       RETURN other.userId AS userId, score
       ORDER BY score DESC
       LIMIT 20`,
      { myId: req.user._id.toString() }
    );

    const userIds = result.records.map(r => r.get('userId'));
    if (userIds.length === 0) return res.json([]);

    // Traer datos completos desde MongoDB
    const users = await User.find({ _id: { $in: userIds } }).select('-password');
    const scoreMap = {};
    result.records.forEach(r => { scoreMap[r.get('userId')] = r.get('score').toNumber(); });

    const candidates = users
      .map(u => ({ ...u.toObject(), compatibilityScore: scoreMap[u._id.toString()] ?? 0 }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    await session.close();
  }
});

// POST /api/matching/swipe
// Body: { targetUserId, direction: 'right' | 'left' }
router.post('/swipe', auth, async (req, res) => {
  const { targetUserId, direction } = req.body;
  if (!targetUserId || !['right', 'left'].includes(direction)) {
    return res.status(400).json({ message: 'targetUserId y direction (right|left) son requeridos' });
  }
  if (targetUserId === req.user._id.toString()) {
    return res.status(400).json({ message: 'No puedes hacer swipe a ti mismo' });
  }

  const session = getDriver().session();
  try {
    const relType = direction === 'right' ? 'SWIPED_RIGHT' : 'SWIPED_LEFT';

    // Registrar el swipe
    await session.run(
      `MATCH (me:User {userId: $myId}), (other:User {userId: $otherId})
       MERGE (me)-[:${relType} {timestamp: $ts}]->(other)`,
      { myId: req.user._id.toString(), otherId: targetUserId, ts: new Date().toISOString() }
    );

    // Si fue swipe right, verificar si es match mutuo
    if (direction === 'right') {
      const mutualCheck = await session.run(
        `MATCH (other:User {userId: $otherId})-[:SWIPED_RIGHT]->(me:User {userId: $myId})
         RETURN other`,
        { myId: req.user._id.toString(), otherId: targetUserId }
      );

      if (mutualCheck.records.length > 0) {
        // Match! Crear relación MATCHED y sumar santokens en Neo4j
        await session.run(
          `MATCH (me:User {userId: $myId}), (other:User {userId: $otherId})
           MERGE (me)-[:MATCHED {timestamp: $ts, santokens: $tokens}]-(other)
           SET me.santokenBalance = coalesce(me.santokenBalance, 0) + $tokens
           SET other.santokenBalance = coalesce(other.santokenBalance, 0) + $tokens`,
          {
            myId: req.user._id.toString(),
            otherId: targetUserId,
            ts: new Date().toISOString(),
            tokens: SANTOKENS_PER_MATCH
          }
        );

        // Sumar santokens en MongoDB para ambos
        await User.findByIdAndUpdate(req.user._id, { $inc: { santokenBalance: SANTOKENS_PER_MATCH } });
        await User.findByIdAndUpdate(targetUserId, { $inc: { santokenBalance: SANTOKENS_PER_MATCH } });

        const matchedUser = await User.findById(targetUserId).select('-password');
        return res.json({ match: true, matchedWith: matchedUser, santokensEarned: SANTOKENS_PER_MATCH });
      }
    }

    res.json({ match: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    await session.close();
  }
});

// GET /api/matching/matches
// Devuelve todos los matches del usuario actual
router.get('/matches', auth, async (req, res) => {
  const session = getDriver().session();
  try {
    const result = await session.run(
      `MATCH (me:User {userId: $myId})-[r:MATCHED]-(other:User)
       RETURN other.userId AS userId, r.timestamp AS matchedAt, r.santokens AS santokens
       ORDER BY r.timestamp DESC`,
      { myId: req.user._id.toString() }
    );

    const userIds = result.records.map(r => r.get('userId'));
    if (userIds.length === 0) return res.json([]);

    const users = await User.find({ _id: { $in: userIds } }).select('-password');
    const metaMap = {};
    result.records.forEach(r => {
      metaMap[r.get('userId')] = {
        matchedAt: r.get('matchedAt'),
        santokens: r.get('santokens')
      };
    });

    const matches = users.map(u => ({
      ...u.toObject(),
      matchedAt: metaMap[u._id.toString()]?.matchedAt,
      santokensEarned: metaMap[u._id.toString()]?.santokens
    }));

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    await session.close();
  }
});

module.exports = router;
