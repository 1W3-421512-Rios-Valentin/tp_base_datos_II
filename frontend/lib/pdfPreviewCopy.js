const PROFILES = [
  {
    keywords: ['base de datos', 'bd', 'sql', 'relacional', 'mysql', 'mongodb'],
    label: 'Crónica del archivo relacional',
    intro: 'Este apunte se siente como la memoria ordenada de los datos: nombres, claves, tablas y relaciones que intentan no perderse entre consultas.',
    body: 'Si el título apunta al mundo de bases de datos, probablemente este material fue pensado para enseñar cómo convivir con la estructura, la integridad y las consultas bien hechas.',
    highlights: ['Modelo relacional', 'Consultas', 'Integridad y claves', 'Persistencia de datos']
  },
  {
    keywords: ['programacion', 'programación', 'codigo', 'código', 'algoritmo', 'javascript', 'python', 'java', 'react', 'node'],
    label: 'Bitácora de código y lógica',
    intro: 'Parece el diario de alguien que aprendió a pensar paso a paso, transformando problemas en instrucciones claras y pequeñas victorias de lógica.',
    body: 'Por su nombre, este material suena a un cuaderno de programación: primero ordena la idea, luego muestra el camino y al final deja una solución lista para ejecutarse.',
    highlights: ['Pensamiento lógico', 'Algoritmos', 'Estructuras de control', 'Práctica de desarrollo']
  },
  {
    keywords: ['matemat', 'algebra', 'álgebra', 'calculo', 'cálculo', 'estadistica', 'estadística', 'geometria', 'geometría'],
    label: 'Cuaderno de fórmulas y demostraciones',
    intro: 'Nace como un mapa para no perderse entre símbolos: cada fórmula funciona como una pista y cada ejemplo como una lámpara encendida.',
    body: 'Si el título remite a matemáticas, este apunte seguramente busca convertir lo abstracto en algo ordenado, usable y hasta elegante.',
    highlights: ['Fórmulas', 'Demostraciones', 'Ejercicios guiados', 'Resolución paso a paso']
  },
  {
    keywords: ['redes', 'network', 'tcp', 'ip', 'internet', 'comunicacion', 'comunicación', 'protocolos'],
    label: 'Mapa de conexiones invisibles',
    intro: 'Este material suena a una travesía por cables, paquetes y rutas: la historia de cómo los mensajes encuentran su destino.',
    body: 'Por su nombre, parece un apunte hecho para explicar el viaje de la información, desde el origen hasta la pantalla final.',
    highlights: ['Protocolos', 'Direcciones', 'Transmisión de datos', 'Arquitectura de red']
  },
  {
    keywords: ['historia', 'literatura', 'filosofia', 'filosofía', 'derecho', 'sociologia', 'sociología', 'psicologia', 'psicología'],
    label: 'Relato de ideas y contexto',
    intro: 'Se presenta como una lectura con memoria: ideas, autores, épocas o conceptos que se enlazan para contar algo más grande que una sola página.',
    body: 'Su nombre sugiere un material más narrativo que técnico, pensado para acompañar una explicación con contexto, ejemplos y sentido.',
    highlights: ['Contexto', 'Conceptos clave', 'Lectura guiada', 'Interpretación']
  },
  {
    keywords: ['administracion', 'administración', 'gestion', 'gestión', 'economia', 'economía', 'marketing', 'contabilidad'],
    label: 'Manual de organización y decisiones',
    intro: 'Este apunte parece hablar de ordenar recursos, tomar decisiones y entender cómo se mueve una estructura cuando todo debe encajar.',
    body: 'Por su nombre, podría ser la biografía de una idea práctica: entender procesos, medir resultados y convertir la teoría en gestión.',
    highlights: ['Procesos', 'Estrategia', 'Recursos', 'Análisis y planificación']
  },
  {
    keywords: ['fisica', 'física', 'quimica', 'química', 'biologia', 'biología', 'ciencia'],
    label: 'Bitácora de observación científica',
    intro: 'Tiene el tono de un cuaderno de laboratorio: observación, hipótesis, método y una explicación que intenta darle forma al mundo.',
    body: 'Si el nombre apunta a ciencias, este material seguramente busca traducir fenómenos complejos en pasos claros y verificables.',
    highlights: ['Método científico', 'Experimentos', 'Variables', 'Resultados']
  }
];

const normalizeText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();

const uniqueWords = (value = '') => {
  const words = normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !['para', 'como', 'pero', 'este', 'esta', 'con', 'los', 'las', 'del', 'una', 'uno', 'sus', 'por', 'que'].includes(word));
  return [...new Set(words)].slice(0, 3);
};

const pickProfile = (text = '') => {
  const normalized = normalizeText(text);
  return PROFILES.find((profile) =>
    profile.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );
};

export function buildPdfPreviewCopy({ title, fileName, category, description } = {}) {
  const sourceText = [title, fileName, category, description].filter(Boolean).join(' ');
  const profile = pickProfile(sourceText);
  const displayTitle = title || fileName || 'Este material';
  const topicWords = uniqueWords(sourceText);

  if (profile) {
    return {
      label: profile.label,
      title: displayTitle,
      intro: profile.intro,
      body: profile.body,
      highlights: profile.highlights,
      closing: 'Aunque el PDF no se abra, este prólogo te da una primera lectura del material.'
    };
  }

  const topicList = topicWords.length > 0 ? topicWords.join(', ') : 'ideas, conceptos y ejemplos';

  return {
    label: 'Prólogo del apunte',
    title: displayTitle,
    intro: `Este material, titulado “${displayTitle}”, parece reunir ${topicList} en un recorrido breve y ordenado.`,
    body: 'Se lee como una introducción pensada para ubicar el tema principal, abrir el contexto y dejar al lector listo para seguir con más detalle.',
    highlights: [
      topicWords[0] ? `Tema central: ${topicWords[0]}` : 'Tema central',
      topicWords[1] ? `Segundo eje: ${topicWords[1]}` : 'Ideas principales',
      topicWords[2] ? `Apoyo conceptual: ${topicWords[2]}` : 'Desarrollo guiado',
      'Cierre de repaso'
    ],
    closing: description
      ? `Además, el autor dejó una pista adicional: “${description}”.`
      : 'Si luego abre el PDF, esta ficha puede servirte como entrada rápida al contenido.'
  };
}
