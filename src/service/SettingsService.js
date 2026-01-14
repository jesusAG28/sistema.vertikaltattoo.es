export const SettingsService = {
    getSettings: () => {
        return {
            dataTable: {
                rows: 10,
                rowsPerPageOptions: [10, 25, 50, 100]
            }
        };
    }
};
