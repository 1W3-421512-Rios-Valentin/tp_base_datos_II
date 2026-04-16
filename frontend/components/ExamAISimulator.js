import { useMemo, useState } from 'react';
import api from '../lib/api';
import Link from 'next/link';
import { FiCpu, FiPlay, FiBookOpen, FiClock, FiCheckCircle } from 'react-icons/fi';

const EXAM_PROFILES = [
  {
    name: 'Base de Datos II',
    aliases: ['base de datos 2', 'base de datos ii', 'bd2', 'db2', 'parcial de base de datos'],
    keywords: ['sql', 'join', 'normalizacion', 'normalización', 'mongo', 'transaccion', 'transacción', 'indice', 'índice', 'modelo relacional', 'consulta', 'bd'],
    preferredCategories: ['programación', 'otros']
  },
  {
    name: 'Programación',
    aliases: ['programacion', 'programación', 'algoritmos', 'parcial de programacion'],
    keywords: ['javascript', 'java', 'python', 'funcion', 'función', 'api', 'backend', 'frontend', 'estructura', 'algoritmo', 'codigo', 'código'],
    preferredCategories: ['programación']
  },
  {
    name: 'Matemática',
    aliases: ['matematica', 'matemática', 'algebra', 'álgebra', 'calculo', 'cálculo'],
    keywords: ['derivada', 'integral', 'limite', 'límite', 'ecuacion', 'ecuación', 'matriz', 'funcion'],
    preferredCategories: ['matemática', 'matemáticas']
  },
  {
    name: 'Física',
    aliases: ['fisica', 'física', 'mecanica', 'mecánica'],
    keywords: ['fuerza', 'movimiento', 'energia', 'energía', 'cinematica', 'cinemática', 'dinamica', 'dinámica'],
    preferredCategories: ['física']
  },
  {
    name: 'Química',
    aliases: ['quimica', 'química', 'quimica general'],
    keywords: ['mol', 'enlace', 'reaccion', 'reacción', 'estequiometria', 'estequiometría', 'compuesto'],
    preferredCategories: ['química']
  },
  {
    name: 'Biología',
    aliases: ['biologia', 'biología', 'genetica', 'genética'],
    keywords: ['celula', 'célula', 'adn', 'proteina', 'proteína', 'ecosistema', 'metabolismo'],
    preferredCategories: ['biología']
  },
  {
    name: 'Economía',
    aliases: ['economia', 'economía', 'microeconomia', 'macroeconomia'],
    keywords: ['oferta', 'demanda', 'elasticidad', 'mercado', 'costo', 'costo marginal', 'inflacion', 'inflación'],
    preferredCategories: ['economía']
  }
];

const normalizeText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pickProfile = (examText) => {
  const normalized = normalizeText(examText);

  const byAlias = EXAM_PROFILES.find((profile) =>
    profile.aliases.some((alias) => normalized.includes(normalizeText(alias)))
  );

  if (byAlias) return byAlias;

  const profileScores = EXAM_PROFILES.map((profile) => {
    const hits = profile.keywords.reduce((acc, keyword) => {
      return normalized.includes(normalizeText(keyword)) ? acc + 1 : acc;
    }, 0);
    return { profile, hits };
  }).sort((a, b) => b.hits - a.hits);

  return profileScores[0].hits > 0
    ? profileScores[0].profile
    : {
        name: 'General',
        aliases: [],
        keywords: normalized.split(' ').filter((token) => token.length > 3),
        preferredCategories: []
      };
};

const evaluateResource = (resource, profile, examText) => {
  const textBlob = normalizeText([
    resource.title,
    resource.description,
    resource.category,
    Array.isArray(resource.tags) ? resource.tags.join(' ') : ''
  ].join(' '));

  const examTokens = normalizeText(examText)
    .split(' ')
    .filter((token) => token.length > 3);

  let score = 0;
  let keywordHits = 0;
  let tokenHits = 0;
  let categoryBoost = false;
  const matchedKeywords = [];

  for (const keyword of profile.keywords || []) {
    if (textBlob.includes(normalizeText(keyword))) {
      score += 3;
      keywordHits += 1;
      if (matchedKeywords.length < 3) matchedKeywords.push(keyword);
    }
  }

  for (const token of examTokens) {
    if (textBlob.includes(token)) {
      score += 2;
      tokenHits += 1;
    }
  }

  const category = normalizeText(resource.category);
  if ((profile.preferredCategories || []).some((cat) => category.includes(normalizeText(cat)))) {
    score += 2;
    categoryBoost = true;
  }

  if (resource.likes?.length) score += Math.min(2, resource.likes.length * 0.15);
  if (resource.views) score += Math.min(2, resource.views * 0.02);

  return {
    score,
    keywordHits,
    tokenHits,
    categoryBoost,
    matchedKeywords
  };
};

const buildRationale = (evaluation) => {
  const reasons = [];

  if (evaluation.keywordHits > 0 && evaluation.matchedKeywords.length > 0) {
    reasons.push(`Temas detectados: ${evaluation.matchedKeywords.join(', ')}`);
  }

  if (evaluation.tokenHits > 0) {
    reasons.push(`Coincidencia directa con el examen (${evaluation.tokenHits})`);
  }

  if (evaluation.categoryBoost) {
    reasons.push('Categoría alineada con la materia');
  }

  if (reasons.length === 0) {
    reasons.push('Buen ajuste general por contenido y relevancia');
  }

  return reasons;
};

export default function ExamAISimulator({ initialResources = [] }) {
  const [examInput, setExamInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLog, setAnalysisLog] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [detectedExam, setDetectedExam] = useState('');

  const quickPrompts = useMemo(
    () => [
      'Parcial de Base de Datos II',
      'Final de Programación',
      'Parcial de Matemática',
      'Recuperatorio de Física'
    ],
    []
  );

  const pushLog = (line) => {
    setAnalysisLog((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: line,
        isTyping: false
      }
    ]);
  };

  const pushTypedLog = async (line, speed = 14) => {
    const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const entryTime = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    setAnalysisLog((prev) => [
      ...prev,
      {
        id: entryId,
        time: entryTime,
        text: '',
        isTyping: true
      }
    ]);

    for (let i = 1; i <= line.length; i += 1) {
      await wait(speed);
      const partial = line.slice(0, i);
      setAnalysisLog((prev) =>
        prev.map((entry) => (entry.id === entryId ? { ...entry, text: partial } : entry))
      );
    }

    setAnalysisLog((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, isTyping: false } : entry))
    );
  };

  const runAnalysis = async () => {
    const trimmed = examInput.trim();
    if (!trimmed || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setRecommendations([]);
    setAnalysisLog([]);

    try {
      const profile = pickProfile(trimmed);
      setDetectedExam(profile.name);
      setAnalysisProgress(8);

      await pushTypedLog('Inicializando motor de recomendación académica...');
      setAnalysisProgress(16);
      await wait(450);
      await pushTypedLog(`Examen detectado: ${profile.name}. Ajustando heurísticas por materia...`);
      setAnalysisProgress(28);
      await wait(350);

      const fresh = await api.get('/resources', { params: { limit: 200 } });
      const pool = Array.isArray(fresh.data) ? fresh.data : initialResources;
      setAnalysisProgress(45);

      await pushTypedLog(`Analizando ${pool.length} apuntes disponibles en el repositorio...`);
      await wait(250);
      await pushTypedLog('Extrayendo temas clave y similitud semántica simulada...');
      setAnalysisProgress(62);
      await wait(250);
      await pushTypedLog('Priorizando apuntes con mejor cobertura teórica y práctica...');
      setAnalysisProgress(78);
      await wait(250);

      const scored = pool
        .map((resource) => ({
          resource,
          evaluation: evaluateResource(resource, profile, trimmed)
        }))
        .map((item) => ({
          ...item,
          score: item.evaluation.score
        }))
        .sort((a, b) => b.score - a.score);

      const filtered = scored.filter((item) => item.score > 0);
      const topResults = (filtered.length ? filtered : scored).slice(0, 3);

      const prepared = topResults.map((item) => ({
        ...item.resource,
        confidence: Math.max(62, Math.min(98, Math.round(60 + item.score * 7.2))),
        rationale: buildRationale(item.evaluation)
      }));

      setRecommendations(prepared);
      setAnalysisProgress(90);

      if (prepared.length > 0) {
        await pushTypedLog(`Recomendación lista: ${prepared.map((r) => `“${r.title}”`).join(', ')}.`);
        await wait(150);
        await pushTypedLog(`Tip rápido: empezá por “${prepared[0].title}”, tiene la señal más fuerte para este examen.`);
      } else {
        await pushTypedLog('No encontré coincidencias fuertes, pero te sugeriría subir más apuntes para afinar el análisis.');
      }

      await wait(350);
      await pushTypedLog('Simulación finalizada. Podés cambiar la materia y volver a ejecutar.');
      setAnalysisProgress(100);
    } catch (error) {
      console.error(error);
      pushLog('Error en la simulación. Reintentá en unos segundos.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="card border border-blue-100 bg-gradient-to-br from-white to-blue-50/40 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Simulador IA</p>
          <h3 className="text-lg sm:text-xl font-semibold text-secondary mt-1">
            Recomendación inteligente para exámenes
          </h3>
          <p className="text-sm text-muted mt-1">
            Escribí qué examen rendís y te sugiero los apuntes necesarios.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
          <FiCpu className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={examInput}
          onChange={(e) => setExamInput(e.target.value)}
          placeholder="Ej: Parcial de Base de Datos II"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing || !examInput.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <FiPlay className="w-4 h-4" />
          {isAnalyzing ? 'Analizando...' : 'Simular análisis'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setExamInput(prompt)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500">Progreso del análisis</span>
          <span className="font-semibold text-primary">{analysisProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${analysisProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 min-h-[210px]">
          <div className="flex items-center gap-2 mb-3">
            <FiClock className="text-blue-600 w-4 h-4" />
            <p className="text-sm font-semibold text-secondary">Análisis en tiempo real</p>
          </div>

          {detectedExam ? (
            <p className="text-xs text-blue-700 mb-2">Perfil detectado: {detectedExam}</p>
          ) : null}

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {analysisLog.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay análisis. Ejecutá una simulación.</p>
            ) : (
              analysisLog.map((entry) => (
                <div key={entry.id} className="text-sm text-gray-700 leading-relaxed">
                  <span className="text-gray-400 mr-2">[{entry.time}]</span>
                  {entry.text}
                  {entry.isTyping ? <span className="inline-block w-2 h-4 ml-1 bg-primary/70 animate-pulse align-middle" /> : null}
                </div>
              ))
            )}

            {isAnalyzing ? (
              <div className="inline-flex items-center gap-2 text-sm text-primary font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Procesando señales académicas...
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 min-h-[210px]">
          <div className="flex items-center gap-2 mb-3">
            <FiBookOpen className="text-green-600 w-4 h-4" />
            <p className="text-sm font-semibold text-secondary">Apuntes recomendados</p>
          </div>

          <div className="space-y-2">
            {recommendations.length === 0 ? (
              <p className="text-sm text-gray-500">Todavía no hay recomendaciones para mostrar.</p>
            ) : (
              recommendations.map((resource) => (
                <Link
                  key={resource._id}
                  href={`/resource/${resource._id}`}
                  className="block border border-gray-100 rounded-lg p-3 hover:border-primary hover:bg-green-50/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-secondary line-clamp-1">{resource.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{resource.category || 'Sin categoría'}</p>
                      {resource.rationale?.length ? (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{resource.rationale.join(' · ')}</p>
                      ) : null}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold whitespace-nowrap">
                      {resource.confidence}% match
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {recommendations.length > 0 ? (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
              <FiCheckCircle className="w-3.5 h-3.5" />
              Recomendación simulada completada
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
