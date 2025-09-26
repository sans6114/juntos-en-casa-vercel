import { firestoreAdmin } from '../firebase/server';
import type { Stats } from '../interfaces';

function normalizeChurchKey(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/\s+/g, ' '); // colapsa espacios
}

let STATS_CACHE: { data: Stats; ts: number } | null = null;
const STATS_TTL_MS = 60_000; // 1 min

export async function getInscripcionesStats(): Promise<Stats> {
  if (STATS_CACHE && Date.now() - STATS_CACHE.ts < STATS_TTL_MS) {
    return STATS_CACHE.data;
  }

  const snapshot = await firestoreAdmin
    .collection('inscripciones')
    .select('name', 'apellido', 'edad', 'iglesiaVS', 'iglesiaNone', 'iglesiaDif', 'iglesiaDifNombre')
    .get();

  if (snapshot.empty) {
    const empty: Stats = {
      total: 0,
      promedioEdad: 0,
      iglesiaVS: 0,
      iglesiaNone: 0,
      iglesiaDif: 0,
      inscripciones: [],
      rango12a17: 0,
      rango18a25: 0,
      rangoMas25: 0,
      nombresIglesiasDif: [],
      cantidadIglesiasDif: 0
    };
    STATS_CACHE = { data: empty, ts: Date.now() };
    return empty;
  }

  const inscripciones = snapshot.docs.map((doc) => doc.data());
  const total = inscripciones.length;
  const totalEdad = inscripciones.reduce((sum, i) => sum + (i.edad || 0), 0);
  const promedioEdad = total > 0 ? totalEdad / total : 0;
  const iglesiaVS = inscripciones.filter((i) => i.iglesiaVS).length;
  const iglesiaNone = inscripciones.filter((i) => i.iglesiaNone).length;
  const iglesiaDif = inscripciones.filter((i) => i.iglesiaDif).length;

  // Dedup con normalización (ignora mayúsculas/acentos/espacios)
  const uniq = new Map<string, string>(); // key normalizada -> nombre representativo
  for (const i of inscripciones) {
    if (i.iglesiaDif && typeof i.iglesiaDifNombre === 'string') {
      const raw = String(i.iglesiaDifNombre).trim();
      if (!raw) continue;
      const key = normalizeChurchKey(raw);
      if (!uniq.has(key)) uniq.set(key, raw);
    }
  }
  const collator = new Intl.Collator('es', { sensitivity: 'base' });
  const nombresIglesiasDif = Array.from(uniq.values()).sort(collator.compare);
  const cantidadIglesiasDif = uniq.size;

  const rangos = inscripciones.reduce<Pick<Stats, 'rango12a17' | 'rango18a25' | 'rangoMas25'>>(
    (acc, i) => {
      const edad = i.edad;
      if (typeof edad === 'number') {
        if (edad >= 12 && edad <= 17) acc.rango12a17++;
        else if (edad >= 18 && edad <= 25) acc.rango18a25++;
        else if (edad > 25) acc.rangoMas25++;
      }
      return acc;
    },
    { rango12a17: 0, rango18a25: 0, rangoMas25: 0 },
  );

  const result: Stats = {
    total,
    promedioEdad,
    iglesiaVS,
    iglesiaNone,
    iglesiaDif,
    inscripciones,
    ...rangos,
    nombresIglesiasDif,
    cantidadIglesiasDif
  };

  STATS_CACHE = { data: result, ts: Date.now() };
  return result;
}