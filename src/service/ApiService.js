import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const baseUrl = import.meta.env.VITE_API_URL;

const ApiService = axios.create({
    baseURL: baseUrl,
    headers: {
        Accept: 'application/json',
        // 'Content-Type': 'application/json'
        //* AL COMENTARLO LARAVEL DETECTA Y LO HACE AUTO COMO JSON O MULTIPART FORM DATA DEPENDE LO QUE ENVIEMOS
    }
});

ApiService.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();

        if (authStore.user?.token) {
            config.headers['Authorization'] = `Bearer ${authStore.user.token}`;
        }

        if (import.meta.env.DEV) {
            console.log('%c ' + config.method.toUpperCase() + ' - ' + config.baseURL + config.url + ':', 'color: #0086b3; font-weight: bold', config);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

ApiService.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log('%c ' + response.status + ' - ' + response.config.baseURL + response.config.url + ':', 'color: #008000; font-weight: bold', response);
        }

        return response;
    },

    (error) => {
        if (error.response) {
            console.error('%c ' + error.response.status + ' - ' + error.response.config.baseURL + error.response.config.url + ':', 'color: #a71d5d; font-weight: bold', error.response);

            // 401: Unauthorized; 419: Session expired
            if (error.response.status === 401 || error.response.status === 419) {
                const authStore = useAuthStore();

                authStore.logout();
            }
        }

        return Promise.reject(error);
    }
);

export { ApiService, baseUrl };
