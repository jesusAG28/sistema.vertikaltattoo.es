
import { ApiService } from './ApiService';

const resource = 'auth';

export const AuthService = {
    login: async (email, password) => {
        return await ApiService.post(`/login`, { email, password } );
    },
    logout: async () => {
        return await ApiService.post(`/logout`);
    },
    forgotPassword: async (email) => {
        return await ApiService.post(`${resource}/forgotten-password`, { email });
    },
    resetPassword: async (email, token, password, password_confirmation) => {
        return await ApiService.post(`${resource}/reset-password`, { email, token, password, password_confirmation });
    },
    user: async () => {
        return await ApiService.get(`/user`);
    },
    profile: async () => {
        return await ApiService.get(`/profile`);
    },
    can: async (permission) => {
        return await ApiService.get(`/${resource}/can/${permission}`);
    },
    personalInformation: async (payload) => {
        return await ApiService.put(`/profile/personal_information`, payload);
    },
    preferences: async (payload) => {
        return await ApiService.put(`/profile/preferences`, payload);
    },
    changePassword: async (payload) => {
        return await ApiService.put(`/profile/change_password`, payload);
    },
    logoutOtherSessions: async (payload) => {
        return await ApiService.put(`/profile/logout_other_sessions`, payload);
    }
};
