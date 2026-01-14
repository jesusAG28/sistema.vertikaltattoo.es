const usersRoutes = [
    {
        path: '',
        name: 'users.list',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.users.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/users/Index.vue')
    },
    {
        path: 'new',
        name: 'users.new',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.users.breadcrumb',
                    to: '/users'
                },
                {
                    translatable: 'navigation.users.new.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/users/New.vue')
    },
    {
        path: 'edit/:id',
        name: 'users.edit',
        meta: {
            breadcrumb: [
                {
                    translatable: 'navigation.users.breadcrumb',
                    to: '/users'
                },
                {
                    translatable: 'navigation.users.edit.breadcrumb'
                }
            ]
        },
        component: () => import('@/views/users/Edit.vue'),
        props: true
    }
];

export default usersRoutes;