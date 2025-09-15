import { firestoreAdmin } from '../firebase/server';
import type { Stats } from '../interfaces';

export async function getInscripcionesStats(): Promise<Stats> {
    const snapshot = await firestoreAdmin.collection('inscripciones').get();

    if(snapshot.empty) {
        return {
            total: 0,
            promedioEdad: 0,
            iglesiaVS: 0,
            iglesiaNone: 0,
            iglesiaDif: 0,
            inscripciones: []
        }
    }

    const inscripciones = snapshot.docs.map(doc => doc.data());
    console.log({ inscripciones });
    const total = inscripciones.length;
    const totalEdad = inscripciones.reduce((sum, inscripcion) => sum + (inscripcion.edad || 0), 0);
    const promedioEdad = total > 0 ? totalEdad / total : 0;
    const iglesiaVS = inscripciones.filter(inscripcion => inscripcion.iglesiaVS).length;
    const iglesiaNone = inscripciones.filter(inscripcion => inscripcion.iglesiaNone).length;
    const iglesiaDif = inscripciones.filter(inscripcion => inscripcion.iglesiaDif).length;
    
    // Rangos solicitados
    const rangos = inscripciones.reduce(
        (acc, i) => {
            const edad = i.edad;
            if (typeof edad !== 'number') return acc;

            if (edad >= 12 && edad <= 17) acc.rango12a17++;
            else if (edad >= 18 && edad <= 25) acc.rango18a25++;
            else if (edad > 25) acc.rangoMas25++;

            return acc;
        },
        { rango12a17: 0, rango18a25: 0, rangoMas25: 0 }
    );
    return {
        total,
        promedioEdad,
        iglesiaVS,
        iglesiaNone,
        iglesiaDif,
        inscripciones,
        ...rangos
    };
}