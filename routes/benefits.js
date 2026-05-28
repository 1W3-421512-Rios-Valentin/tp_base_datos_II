const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Benefit = require('../models/Benefit');
const Redemption = require('../models/Redemption');
const User = require('../models/User');

// GET /api/benefits — todos los beneficios activos con datos del lugar
router.get('/', async (req, res) => {
  try {
    const benefits = await Benefit.find({ isActive: true })
      .populate('place', 'name type address image')
      .sort({ tokenCost: 1 });

    // Filtrar vencidos
    const now = new Date();
    const active = benefits.filter(b => !b.expiresAt || b.expiresAt > now);

    res.json({ benefits: active });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/benefits/:id — detalle de un beneficio
router.get('/:id', async (req, res) => {
  try {
    const benefit = await Benefit.findById(req.params.id)
      .populate('place', 'name type address description image isStudyPlace');
    if (!benefit) return res.status(404).json({ message: 'Beneficio no encontrado' });
    res.json({ benefit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/benefits/:id/redeem — canjear beneficio
router.post('/:id/redeem', auth, async (req, res) => {
  try {
    const benefit = await Benefit.findById(req.params.id).populate('place', 'name');
    if (!benefit || !benefit.isActive) {
      return res.status(404).json({ message: 'Beneficio no disponible' });
    }

    // Verificar vencimiento
    if (benefit.expiresAt && new Date() > benefit.expiresAt) {
      return res.status(400).json({ message: 'Este beneficio ha vencido' });
    }

    // Verificar stock
    if (benefit.stock !== null && benefit.stock <= 0) {
      return res.status(400).json({ message: 'Sin stock disponible' });
    }

    // Verificar balance del usuario
    const user = await User.findById(req.user._id);
    if (user.santokenBalance < benefit.tokenCost) {
      return res.status(400).json({
        message: `Necesitás ${benefit.tokenCost} SanTokens pero tenés ${user.santokenBalance}`
      });
    }

    // Generar código único de 8 caracteres
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Transacción: descontar tokens + crear redención + actualizar stock
    const [redemption] = await Promise.all([
      Redemption.create({
        user: req.user._id,
        benefit: benefit._id,
        tokensSpent: benefit.tokenCost,
        code
      }),
      User.findByIdAndUpdate(req.user._id, {
        $inc: { santokenBalance: -benefit.tokenCost }
      }),
      benefit.stock !== null
        ? Benefit.findByIdAndUpdate(benefit._id, { $inc: { stock: -1 } })
        : Promise.resolve()
    ]);

    res.json({
      message: 'Canje exitoso',
      code: redemption.code,
      tokensSpent: benefit.tokenCost,
      benefitTitle: benefit.title,
      placeName: benefit.place.name
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
