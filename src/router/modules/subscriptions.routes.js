const subscriptionsRoutes = [
    {
        path: '',
        name: 'subscriptions.list',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.subscriptions.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/subscriptions/Index.vue')
    },
    {
        path: 'new',
        name: 'subscriptions.new',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.subscriptions.breadcrumb',
                    to: '/subscriptions'
                },
                {
                    translatable: 'navigation.subscriptions.new.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/subscriptions/New.vue')
    },
    {
        path: 'edit/:id',
        name: 'subscriptions.edit',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.subscriptions.breadcrumb',
                    to: '/subscriptions'
                },
                {
                    translatable: 'navigation.subscriptions.edit.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/subscriptions/Edit.vue'),
        props: true
    }
];

export default subscriptionsRoutes;