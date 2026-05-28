const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const Benefit = require('../models/Benefit');

// GET /api/places — todos los lugares (filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.studyOnly === 'true') filter.isStudyPlace = true;

    const places = await Place.find(filter).sort({ name: 1 });
    res.json({ places });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/places/nearby?lat=X&lon=Y&radius=5000
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 5000, studyOnly } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Se requieren lat y lon' });
    }

    const filter = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    };
    if (studyOnly === 'true') filter.isStudyPlace = true;

    const places = await Place.find(filter);

    // Enriquecer con cantidad de beneficios activos
    const enriched = await Promise.all(
      places.map(async (p) => {
        const benefitCount = await Benefit.countDocuments({ place: p._id, isActive: true });
        const obj = p.toObject();
        // Calcular distancia aproximada en metros
        const R = 6371000;
        const dLat = ((parseFloat(lat) - p.location.coordinates[1]) * Math.PI) / 180;
        const dLon = ((parseFloat(lon) - p.location.coordinates[0]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((p.location.coordinates[1] * Math.PI) / 180) *
            Math.cos((parseFloat(lat) * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
        return { ...obj, benefitCount, distance };
      })
    );

    res.json({ places: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/places/:id — detalle de un lugar + sus beneficios activos
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Lugar no encontrado' });

    const benefits = await Benefit.find({ place: place._id, isActive: true });
    res.json({ place, benefits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
