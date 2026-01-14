const rolesRoutes = [
    {
        path: '',
        name: 'roles.list',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.roles.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/roles/Index.vue')
    },
    {
        path: 'new',
        name: 'roles.new',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.roles.breadcrumb',
                    to: '/roles'
                },
                {
                    translatable: 'navigation.roles.new.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/roles/New.vue')
    },
    {
        path: 'edit/:id',
        name: 'roles.edit',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.roles.breadcrumb',
                    to: '/roles'
                },
                {
                    translatable: 'navigation.roles.edit.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/roles/Edit.vue'),
        props: true
    }
];

export default rolesRoutes;