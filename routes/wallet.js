const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDriver } = require('../config/neo4j');
const User = require('../models/User');

// GET /api/wallet/balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('santokenBalance username');
    res.json({ balance: user.santokenBalance, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/wallet/history
// Devuelve todas las transacciones de santokens (por ahora, matches)
router.get('/history', auth, async (req, res) => {
  const session = getDriver().session();
  try {
    const result = await session.run(
      `MATCH (me:User {userId: $myId})-[r:MATCHED]-(other:User)
       RETURN other.userId AS fromUserId,
              other.username AS fromUsername,
              r.santokens AS amount,
              r.timestamp AS createdAt,
              'match' AS type
       ORDER BY r.timestamp DESC`,
      { myId: req.user._id.toString() }
    );

    const transactions = result.records.map(r => ({
      type: r.get('type'),
      amount: r.get('amount'),
      fromUserId: r.get('fromUserId'),
      fromUsername: r.get('fromUsername'),
      createdAt: r.get('createdAt'),
      description: `Match con ${r.get('fromUsername')}`
    }));

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    await session.close();
  }
});

module.exports = router;
