const entities_subscriptionsRoutes = [
    {
        path: '',
        name: 'entities_subscriptions.list',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.entities_subscriptions.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/entities_subscriptions/Index.vue')
    },
    {
        path: 'new',
        name: 'entities_subscriptions.new',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.entities_subscriptions.breadcrumb',
                    to: '/entities_subscriptions'
                },
                {
                    translatable: 'navigation.entities_subscriptions.new.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/entities_subscriptions/New.vue')
    },
    {
        path: 'edit/:id',
        name: 'entities_subscriptions.edit',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.entities_subscriptions.breadcrumb',
                    to: '/entities_subscriptions'
                },
                {
                    translatable: 'navigation.entities_subscriptions.edit.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/entities_subscriptions/Edit.vue'),
        props: true
    }
];

export default entities_subscriptionsRoutes;