const invoicesRoutes = [
    {
        path: '',
        name: 'invoices.list',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.invoices.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/invoices/Index.vue')
    },
    {
        path: 'new',
        name: 'invoices.new',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.invoices.breadcrumb',
                    to: '/invoices'
                },
                {
                    translatable: 'navigation.invoices.new.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/invoices/New.vue')
    },
    {
        path: 'edit/:id',
        name: 'invoices.edit',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.invoices.breadcrumb',
                    to: '/invoices'
                },
                {
                    translatable: 'navigation.invoices.edit.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/invoices/Edit.vue'),
        props: true
    }
];

export default invoicesRoutes;