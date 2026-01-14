import { z } from 'zod';

/**
 * Datos iniciales de usuarios
 */
export const initialUserState = {
    id: 0,
    name: '',
    email: '',
    roles: [],
    active: true,
    password: '',
    password_confirmation: '',
    preferences: {
        locale: 'es',
        theme: 'light'
    },
    created_at: null,
    updated_at: null
};

export function createUserFromApi(apiData) {
    if (!apiData) return { ...initialUserState };

    const user = {
        id: apiData?.id ?? 0,
        name: apiData?.name ?? '',
        email: apiData?.email ?? '',
        roles: Array.isArray(apiData?.roles) ? apiData?.roles?.map((role) => role.name) : [],
        active: apiData?.active ?? true,
        password: apiData?.password ?? '',
        password_confirmation: apiData?.password_confirmation ?? '',
        preferences: {
            locale: apiData?.preferences?.locale ?? 'es',
            theme: apiData?.preferences?.theme ?? 'light'
        },
        created_at: apiData?.created_at ?? null,
        updated_at: apiData?.updated_at ?? null
    };

    return user;
}

export const getUserSchema = (t, modeCreate = true) => {
    let objectSchema = {
        name: z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('user.attributes.name') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.name') }) }),
        email: z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('user.attributes.email') }) })
            .email({ message: t('validation.email', { attribute: t('user.attributes.email') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.email') }) }),
        preferences: z
            .object({
                locale: z.string(),
                theme: z.string()
            })
            .optional(),
        active: z.boolean()
    };

    if (modeCreate) {
        objectSchema.password = z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('user.attributes.password') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.password') }) });

        objectSchema.password_confirmation = z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('user.attributes.password_confirmation') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.password_confirmation') }) });
    } else {
        objectSchema.password = z
            .string()
            .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.password') }) })
            .optional()
            .nullable();

        objectSchema.password_confirmation = z
            .string()
            .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.password_confirmation') }) })
            .optional()
            .nullable();
    }

    return z.object(objectSchema).refine((data) => data.password === data.password_confirmation, {
        message: t('validation.confirmed', { attribute: t('user.attributes.password') }),
        path: ['password_confirmation']
    });
};
