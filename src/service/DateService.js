const monthsList = [
    { label: 'date.months.january', value: 0 },
    { label: 'date.months.february', value: 1 },
    { label: 'date.months.march', value: 2 },
    { label: 'date.months.april', value: 3 },
    { label: 'date.months.may', value: 4 },
    { label: 'date.months.june', value: 5 },
    { label: 'date.months.july', value: 6 },
    { label: 'date.months.august', value: 7 },
    { label: 'date.months.september', value: 8 },
    { label: 'date.months.october', value: 9 },
    { label: 'date.months.november', value: 10 },
    { label: 'date.months.december', value: 11 }
];
export const DateService = {
    date: {
        toPayloadFormat: (date) => `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`
    },
    time: {
        toPayloadFormat: (date) => `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`
    },
    datetime: {
        toPayloadFormat: (date) => `${DateService.date.toPayloadFormat(date)} ${DateService.time.toPayloadFormat(date)}`
    },
    months: [...monthsList],
    getMonth: (index) => {
        let index_number = new Number(index);

        let month = monthsList.find((month) => month.value == index_number);

        return month ?? null;
    }
};
