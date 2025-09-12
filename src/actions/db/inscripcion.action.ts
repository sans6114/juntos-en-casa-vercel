import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
  addDoc,
  collection,
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
                iglesiaDifNombre: iglesiaDifNombre || null,
                timestamp: new Date()
            })
            return {
                id: incripcionRef.id,
                success: true,
                message: 'Inscripción realizada con éxito'
        }
        } catch (error) {
            console.error('Error al realizar la inscripción:', error);
            return { success: false, message: 'Error al realizar la inscripción'}
        }
    }
  })
  
  