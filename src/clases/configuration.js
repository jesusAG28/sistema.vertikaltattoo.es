/**
 * Función para devolver los datos de la API
 * @param {*} apiData
 * @returns
 */
export function createConfigurationFromApi(apiData) {
    if (!apiData) return { configuration: [] };

    let configuration = [];
    for (const [clave, valor] of Object.entries(apiData)) {
        configuration.push({
            name: clave,
            value: valor ?? ''
        });
    }

    return {
        configuration
    };
}
