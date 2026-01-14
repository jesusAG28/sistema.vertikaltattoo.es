import { ref } from 'vue';

/**
 * Composable especialista para cargar datos para campos 'Select'.
 * Gestiona el estado de carga y automáticamente muestra una notificación ('toast') en caso de error,
 * si se le proporcionan las herramientas para ello.
 *
 * @param {Function} serviceMethod La función del servicio que devuelve la promesa.
 * @param {Object} options Opciones de configuración.
 * @param {import('vue-i18n').useI18n} options.i18n Instancia para traducciones (`{ t }`).
 * @param {import('primevue/usetoast').useToast} options.toast Instancia para mostrar notificaciones.
 * @param {string} options.errorMsgKey La clave de traducción para el mensaje de error.
 * @param {string} [options.dataValue='data'] El conjunto de los datos dentro de la respuesta de la API.
 */
export function useSelectData(serviceMethod, options = {}) {
    const { i18n, toast, errorMsgKey, dataValue = 'data' } = options;

    const items = ref([]);
    const loading = ref(false);

    const fetchData = async () => {
        loading.value = true;
        try {
            const response = await serviceMethod();
            if (response.data && response.data[dataValue]) {
                items.value = response.data[dataValue];
            }
        } catch (axiosError) {
            // console.error(`[useSelectData] Error fetching data:`, axiosError);
            
            // Si el componente ha inyectado las dependencias, muestra el toast.
            if (i18n && toast && errorMsgKey) {
                toast.add({
                    severity: 'error',
                    summary: i18n.t(errorMsgKey),
                    detail: axiosError.response?.data?.message,
                    life: 3000
                });
            }
        } finally {
            loading.value = false;
        }
    };

    return {
        items,
        loading,
        fetchData
    };
}