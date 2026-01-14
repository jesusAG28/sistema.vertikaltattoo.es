import { ApiService } from './ApiService';

export const FileService = {
    upload: async (file) => {
        const payload = new FormData();
        payload.append('file', new File([file], 'upload'));

        return await ApiService.post('/upload', payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    createObjectURL: (file) => {
        let src = URL.createObjectURL(file);

        setTimeout(() => {
            URL.revokeObjectURL(src);
        }, 1000);

        return src;
    },
    size: (size) => {
        if (size < 1e3) {
            return `${size} bytes`;
        } else if (size >= 1e3 && size < 1e6) {
            return `${(size / 1e3).toFixed(1)} KB`;
        } else {
            return `${(size / 1e6).toFixed(1)} MB`;
        }
    }
};
