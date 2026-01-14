const entitiesRoutes = [
    {
        path: '',
        name: 'entities.list',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.entities.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/entities/Index.vue')
    },
    {
        path: 'new',
        name: 'entities.new',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.entities.breadcrumb',
                    to: '/entities'
                },
                {
                    translatable: 'navigation.entities.new.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/entities/New.vue')
    },
    {
        path: 'edit/:id',
        name: 'entities.edit',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.entities.breadcrumb',
                    to: '/entities'
                },
                {
                    translatable: 'navigation.entities.edit.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/entities/Edit.vue'),
        props: true
    }
];

export default entitiesRoutes;