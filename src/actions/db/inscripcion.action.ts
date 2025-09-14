import {
  ActionError,
  defineAction,
} from 'astro:actions';
import { z } from 'astro:schema';
import {
  addDoc,
  collection,
  FirestoreError,
} from 'firebase/firestore';

import { firebase } from '../../firebase/config';

export const inscripcionDB = defineAction({
    accept: 'json',
    input: z.object({
        uid: z.string().min(2, 'El UID debe tener al menos 2 caracteres'),
        name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
        edad: z.number().min(0, 'La edad debe ser un número positivo'),
        iglesiaVS: z.boolean().optional(),
        iglesiaNone: z.boolean().optional(),
        iglesiaDif: z.boolean().optional(),
        iglesiaDifNombre: z.string().optional(),
    }),
    handler: async ({uid, name, edad, iglesiaVS, iglesiaNone, iglesiaDif, iglesiaDifNombre}) => {
        try {
            const incripcionRef = await addDoc(collection(firebase.db, 'inscripciones'), {
                uid,
                name,
                edad,
                iglesiaVS: iglesiaVS || false,
                iglesiaNone: iglesiaNone || false,
                iglesiaDif: iglesiaDif || false,
                iglesiaDifNombre: iglesiaDifNombre || null, // Usar null en lugar de undefined
                timestamp: new Date()
            });
            console.log({
                uid,
                name,
                edad,
                iglesiaVS,
                iglesiaNone,
                iglesiaDif,
                iglesiaDifNombre
            })
            return {
                id: incripcionRef.id,
                success: true,
                message: 'Inscripción realizada con éxito'
            };
            
        } catch (error) {
            const firebaseError = error as FirestoreError;
            
            if (firebaseError.code === 'permission-denied') {
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: 'No tienes permisos para realizar esta inscripción'
                });
            }
            
            if (firebaseError.code === 'unavailable') {
                throw new ActionError({
                    code: "SERVICE_UNAVAILABLE",
                    message: 'El servicio no está disponible temporalmente'
                });
            }
            
            // Error genérico para cualquier otro caso
            throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: 'Error al realizar la inscripción'
            });
        }
    }
});

