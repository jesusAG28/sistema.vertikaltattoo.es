import AppLayout from '@/layout/AppLayout.vue';
import LandingLayout from '@/layout/LandingLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import entitiesRoutes from './modules/entities.routes';
import usersRoutes from './modules/users.routes';
import rolesRoutes from './modules/roles.routes';
import subscriptionsRoutes from './modules/subscriptions.routes';
import entities_subscriptionsRoutes from './modules/entities_subscriptions.routes';
import invoicesRoutes from './modules/invoices.routes';

const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: '/',
                name: '',
                meta: { breadcrumb: [{translatable: 'navigation.home.breadcrumb'}] },
                component: () => import('@/views/dashboard/DashboardView.vue')
            },
            {
                path: '/dashboard-e-commerce',
                name: 'e-commerce',
                meta: {
                    breadcrumb: ['E-Commerce Dashboard']
                },
                component: () => import('@/views/dashboard/EcommerceView.vue')
            },
            {
                path: '/dashboard-banking',
                name: 'dashboard-banking',
                meta: {
                    breadcrumb: ['Banking Dashboard']
                },
                component: () => import('@/views/dashboard/BankingView.vue')
            },
            {
                path: 'entities',
                name: 'entities',
                meta: { breadcrumb: [{ translatable: 'navigation.entities.breadcrumb' }] },
                children: entitiesRoutes
            },
            {
                path: 'subscriptions',
                name: 'subscriptions',
                meta: { breadcrumb: [{ translatable: 'navigation.subscriptions.breadcrumb' }] },
                children: subscriptionsRoutes
            },
            {
                path: 'entities_subscriptions',
                name: 'entities_subscriptions',
                meta: { breadcrumb: [{ translatable: 'navigation.entities_subscriptions.breadcrumb' }] },
                children: entities_subscriptionsRoutes
            },
            {
                path: 'invoices',
                name: 'invoices',
                meta: { breadcrumb: [{ translatable: 'navigation.invoices.breadcrumb' }] },
                children: invoicesRoutes
            },
            {
                path: 'configuration',
                name: 'configuration',
                meta: { breadcrumb: [{ translatable: 'navigation.settings.breadcrumb' }] },
                component: () => import('@/views/configuration/Edit.vue')
            },
            {
                path: 'users',
                name: 'users',
                meta: { breadcrumb: [{ translatable: 'navigation.users.breadcrumb' }] },
                children: usersRoutes
            },
            {
                path: 'roles',
                name: 'roles',
                meta: { breadcrumb: [{ translatable: 'navigation.roles.breadcrumb' }] },
                children: rolesRoutes
            },
            {
                path: '/profile',
                name: 'profile',
                meta: { breadcrumb: [{ translatable: 'navigation.profile.breadcrumb' }] },
                component: () => import('@/views/auth/Profile.vue')
            },
            // {
                // path: '/stage',
                // name: 'stage',
                // meta: {
                //     breadcrumb: ['Stage']
                // },
                // children: [
                    // {
                    //     path: 'image-upload',
                    //     name: 'stage.image_upload',
                    //     meta: {
                    //         breadcrumb: ['Image Upload']
                    //     },
                    //     component: () => import('@/views/stage/ImageUpload.vue')
                    // },
                    // {
                    //     path: 'image-cropper-custom',
                    //     name: 'stage.image_cropper_custom',
                    //     meta: {
                    //         breadcrumb: ['(Discarded) Custom image cropper']
                    //     },
                    //     component: () => import('@/views/stage/discarded/ImageCropperCustom.vue')
                    // },
                    // {
                    //     path: 'image-cropper',
                    //     name: 'stage.image_cropper',
                    //     meta: {
                    //         breadcrumb: ['Image cropper']
                    //     },
                    //     component: () => import('@/views/stage/ImageCropper.vue')
                    // },
                    // {
                    //     path: 'image-manager',
                    //     name: 'stage.image_manager',
                    //     meta: {
                    //         breadcrumb: ['Image manager']
                    //     },
                    //     component: () => import('@/views/stage/ImageManager.vue')
                    // }
                // ]
            // },
            // {
            //     path: '/pages/empty',
            //     name: 'empty',
            //     component: () => import('@/views/pages/Empty.vue')
            // },
            // {
            //     path: '/pages/crud',
            //     name: 'crud',
            //     component: () => import('@/views/pages/Crud.vue')
            // },
            // {
            //     path: '/documentation',
            //     name: 'documentation',
            //     component: () => import('@/views/utilities/Documentation.vue')
            // },
            // {
            //     path: '/pages/aboutus',
            //     name: 'aboutus',
            //     meta: {
            //         breadcrumb: ['Pages', 'About']
            //     },
            //     component: () => import('@/views/pages/AboutUs.vue')
            // },
            // {
            //     path: '/pages/faq',
            //     name: 'faq',
            //     meta: {
            //         breadcrumb: ['Pages', 'FAQ']
            //     },
            //     component: () => import('@/views/pages/Faq.vue')
            // },
            // {
            //     path: '/pages/help',
            //     name: 'help',
            //     component: () => import('@/views/pages/Help.vue')
            // },
            // {
            //     path: '/pages/invoice',
            //     name: 'invoice',
            //     component: () => import('@/views/pages/Invoice.vue')
            // }
        ]
    },
    {
        path: '/landing',
        component: LandingLayout,
        children: [
            {
                path: '',
                name: 'landing',
                component: () => import('@/views/landing/LandingView.vue')
            },
            {
                path: 'about',
                name: 'about',
                component: () => import('@/views/landing/AboutView.vue')
            },
            {
                path: 'pricing',
                name: 'pricing',
                component: () => import('@/views/landing/PricingView.vue')
            },
            {
                path: 'contact',
                name: 'contact',
                component: () => import('@/views/landing/ContactView.vue')
            },
            {
                path: 'register',
                name: 'register',
                component: () => import('@/views/auth/RegisterView.vue')
            },
            {
                path: 'verification',
                name: 'verification',
                component: () => import('@/views/auth/VerificationView.vue')
            },
            {
                path: 'new-password',
                name: 'new-password',
                component: () => import('@/views/auth/NewPassword.vue')
            },
            {
                path: 'lock-screen',
                name: 'lock-screen',
                component: () => import('@/views/auth/LockScreen.vue')
            },
            {
                path: 'access',
                name: 'access',
                component: () => import('@/views/pages/AccessDenied.vue')
            },
            {
                path: 'oops',
                name: 'oops',
                component: () => import('@/views/pages/Oops.vue')
            }
        ],
        meta: { scrollToTop: true }
    },
    // {
    //     path: '/auth',
    //     component: AuthLayout,
    //     children: [],
    //     meta: { scrollToTop: true }
    // },
    {
        path: '/login',
        component: LandingLayout,
        children: [
            {
                path: '',
                name: 'login',
                component: () => import('@/views/auth/Login.vue')
            }
        ],
        meta: { scrollToTop: true }
    },
    {
        path: '/forgot-password',
        component: LandingLayout,
        children: [
            {
                path: '',
                name: 'forgot-password',
                component: () => import('@/views/auth/ForgotPassword.vue')
            }
        ],
        meta: { scrollToTop: true }
    },
    {
        path: '/reset-password',
        component: LandingLayout,
        children: [
            {
                path: '',
                name: 'reset-password',
                component: () => import('@/views/auth/ResetPassword.vue')
            }
        ],
        meta: { scrollToTop: true }
    },

    {
        path: '/pages/notfound',
        name: 'notfound',
        component: () => import('@/views/pages/NotFound.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',
        component: () => import('@/views/pages/NotFound.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { left: 0, top: 0 };
    }
});

router.beforeEach(async (to) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/login', '/forgot-password', '/reset-password'];
    const authRequired = !publicPages.includes(to.path);
    const authStore = useAuthStore();

    if (authRequired && !authStore.user) {
        authStore.returnUrl = to.fullPath;
        return '/login';
    } else if (!authRequired && authStore.user) {
        return '/';
    }
});

export default router;
