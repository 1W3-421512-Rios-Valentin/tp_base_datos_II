require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../models/Place');
const Benefit = require('../models/Benefit');

// Coordenadas base: Córdoba Capital, Argentina (-31.4167, -64.1833)
const places = [
  {
    name: 'Café de la Facultad',
    type: 'café',
    address: 'Av. Vélez Sársfield 1611, Córdoba',
    location: { type: 'Point', coordinates: [-64.1864, -31.4356] },
    description: 'El café de siempre, al lado de la facu. WiFi rápido y enchufes en cada mesa.',
    isStudyPlace: true
  },
  {
    name: 'La Biblioteca Pública',
    type: 'biblioteca',
    address: 'Gral. San Martín 112, Córdoba',
    location: { type: 'Point', coordinates: [-64.1846, -31.4130] },
    description: 'Biblioteca pública con salas de estudio, silencio garantizado y WiFi gratuito.',
    isStudyPlace: true
  },
  {
    name: 'Café Filosófico',
    type: 'café',
    address: 'Obispo Trejo 323, Córdoba',
    location: { type: 'Point', coordinates: [-64.1870, -31.4150] },
    description: 'Ambiente relajado con mesas grandes, ideal para grupos de estudio.',
    isStudyPlace: true
  },
  {
    name: 'Panadería del Centro',
    type: 'panadería',
    address: '27 de Abril 352, Córdoba',
    location: { type: 'Point', coordinates: [-64.1855, -31.4170] },
    description: 'Medialunas y facturas recién salidas del horno. Desayuno y merienda.',
    isStudyPlace: false
  },
  {
    name: 'Restaurante El Estudio',
    type: 'restaurante',
    address: 'Av. Colón 876, Córdoba',
    location: { type: 'Point', coordinates: [-64.1890, -31.4200] },
    description: 'Menú del día para estudiantes con precio especial.',
    isStudyPlace: false
  },
  {
    name: 'Bar La UTN',
    type: 'bar',
    address: 'Maestro López s/n, Córdoba',
    location: { type: 'Point', coordinates: [-64.1923, -31.4400] },
    description: 'Bar estudiantil con WiFi, mesas largas y proyector para estudiar en grupo.',
    isStudyPlace: true
  },
  {
    name: 'Librería del Estudiante',
    type: 'librería',
    address: 'Av. Vélez Sársfield 250, Córdoba',
    location: { type: 'Point', coordinates: [-64.1850, -31.4300] },
    description: 'Fotocopias, cuadernos, resaltadores y todo el material que necesitás.',
    isStudyPlace: false
  }
];

const benefitsData = [
  {
    placeName: 'Café de la Facultad',
    benefits: [
      { title: 'Café + medialuna gratis', description: 'Un café con leche y una medialuna sin cargo al consumir por más de $1500.', tokenCost: 15 },
      { title: '2x1 en muffins', description: 'Comprás uno y te llevás dos. Válido todo el día.', tokenCost: 10 }
    ]
  },
  {
    placeName: 'La Biblioteca Pública',
    benefits: [
      { title: 'Reserva sala privada 2hs', description: 'Reservá una sala de estudio privada por 2 horas sin cargo.', tokenCost: 20 }
    ]
  },
  {
    placeName: 'Café Filosófico',
    benefits: [
      { title: '20% off en bebidas calientes', description: 'Descuento del 20% en cualquier café, té o chocolate.', tokenCost: 8 },
      { title: 'Tabla de snacks gratis', description: 'Una tabla de quesos y fiambres de cortesía para tu grupo de estudio (mín. 3 personas).', tokenCost: 30 }
    ]
  },
  {
    placeName: 'Panadería del Centro',
    benefits: [
      { title: '6 medialunas por el precio de 4', description: 'Pedís 6 y pagás solo 4. Ideal para el recreo.', tokenCost: 5 },
      { title: 'Docena de facturas con 25% off', description: 'Una docena variada con descuento especial para estudiantes.', tokenCost: 12 }
    ]
  },
  {
    placeName: 'Restaurante El Estudio',
    benefits: [
      { title: 'Menú del día gratis', description: 'Almuerzo completo (entrada, plato y postre) sin costo.', tokenCost: 40 }
    ]
  },
  {
    placeName: 'Bar La UTN',
    benefits: [
      { title: 'Cerveza artesanal a mitad de precio', description: 'Una pinta de cerveza artesanal al 50% de descuento.', tokenCost: 10 },
      { title: '2x1 en empanadas', description: 'Comprás 6 empanadas y te damos 6 más.', tokenCost: 18 }
    ]
  },
  {
    placeName: 'Librería del Estudiante',
    benefits: [
      { title: '50 fotocopias gratis', description: 'Cincuenta páginas de fotocopias sin cargo.', tokenCost: 7 },
      { title: 'Cuaderno universitario gratis', description: 'Un cuaderno universitario tapa dura de regalo.', tokenCost: 25 }
    ]
  }
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || (
    process.env.MONGO_USER && process.env.MONGO_PASSWORD && process.env.MONGO_HOST
      ? `mongodb+srv://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@${process.env.MONGO_HOST}/${process.env.MONGO_DB || 'studytree'}?retryWrites=true&w=majority`
      : undefined
  );

  if (!mongoUri) {
    console.error('Falta MONGO_URI en .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB conectado');

  // Limpiar datos previos
  await Place.deleteMany({});
  await Benefit.deleteMany({});
  console.log('Colecciones limpiadas');

  // Insertar lugares
  const insertedPlaces = await Place.insertMany(places);
  console.log(`${insertedPlaces.length} lugares insertados`);

  // Insertar beneficios
  const benefitsToInsert = [];
  for (const bd of benefitsData) {
    const place = insertedPlaces.find(p => p.name === bd.placeName);
    if (!place) continue;
    for (const b of bd.benefits) {
      benefitsToInsert.push({ ...b, place: place._id });
    }
  }

  const insertedBenefits = await Benefit.insertMany(benefitsToInsert);
  console.log(`${insertedBenefits.length} beneficios insertados`);

  console.log('\n✅ Seed completado exitosamente!');
  console.log('Lugares y beneficios listos para la demo.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
