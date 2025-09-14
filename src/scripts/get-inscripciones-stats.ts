import { firestoreAdmin } from '../firebase/server';
import type { Stats } from '../interfaces';

export async function getInscripcionesStats(): Promise<Stats | undefined> {
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
    
    const total = inscripciones.length;
    const totalEdad = inscripciones.reduce((sum, inscripcion) => sum + (inscripcion.edad || 0), 0);
    const promedioEdad = total > 0 ? totalEdad / total : 0;
    const iglesiaVS = inscripciones.filter(inscripcion => inscripcion.iglesiaVS).length;
    const iglesiaNone = inscripciones.filter(inscripcion => inscripcion.iglesiaNone).length;
    const iglesiaDif = inscripciones.filter(inscripcion => inscripcion.iglesiaDif).length;

    return {
        total,
        promedioEdad,
        iglesiaVS,
        iglesiaNone,
        iglesiaDif,
        inscripciones
    };
}