import { z } from 'zod';
import { initialSerieState } from './invoiceSerie';

/**
 * Datos iniciales de roles
 */
export const initialRoleState = {
    name: ''
};

export const getRoleSchema = (t) => {
    // Se puede añadir lògica por si el formulario es update y tiene otro validador
    // mode = 'create'

    return z.object({
        name: z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('role.attributes.name') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('role.attributes.name') }) })
    });
};

/**
 * Función para devolver los datos de la API
 * @param {*} apiData
 * @returns
 */
export function createRoleFromApi(apiData) {
    if (!apiData) return { ...initialSerieState };

    return {
        name: apiData.name ?? ''
    };
}
