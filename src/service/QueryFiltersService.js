export const translateQueryFilters = (values, stringLabel) => {
    const appliedQueryFilters = [];
    for (const [key, value] of Object.entries(values)) {
        if (!value) {
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (item.name) {
                    appliedQueryFilters.push({
                        key,
                        label: `${stringLabel}.${key}`,
                        value: item.name
                    });
                }
            }
        } else if (typeof value === 'object' && value?.name) {
            appliedQueryFilters.push({
                key,
                label: `${stringLabel}.${key}`,
                translatable: value.name
            });
        } else {
            appliedQueryFilters.push({
                key,
                label: `${stringLabel}.${key}`,
                value
            });
        }
    }

    return appliedQueryFilters;
};
