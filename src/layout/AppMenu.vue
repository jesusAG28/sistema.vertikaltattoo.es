<script setup>
import { ref, watch } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { useLayout } from '@/layout/composables/layout';

const { layoutConfig, secondaryMenuStyle } = useLayout();

const usePlantilla = ref(false);
const useHorizontal = ref(secondaryMenuStyle.value.includes(layoutConfig.menuMode));

const plantilla = ref([
    {
        items: [
            { separator: true },
            {
                label: 'Plantilla',
                icon: 'pi pi-fw pi-prime',
                items: [
                    {
                        label: 'Dashboards',
                        icon: 'pi pi-home',
                        items: [
                            {
                                label: 'Marketing',
                                icon: 'pi pi-fw pi-gauge',
                                to: '/'
                            },
                            {
                                label: 'E-Commerce',
                                icon: 'pi pi-fw pi-warehouse',
                                to: '/dashboard-e-commerce'
                            },
                            {
                                label: 'Banking',
                                icon: 'pi pi-fw pi-building-columns',
                                to: '/dashboard-banking'
                            }
                        ]
                    },
                    {
                        label: 'Prime Blocks',
                        icon: 'pi pi-fw pi-prime',
                        items: [
                            {
                                label: 'All Blocks',
                                icon: 'pi pi-fw pi-globe',
                                url: 'https://primeblocks.org',
                                target: '_blank'
                            }
                        ]
                    },
                    {
                        label: 'Pages',
                        icon: 'pi pi-fw pi-briefcase',
                        items: [
                            {
                                label: 'Landing',
                                icon: 'pi pi-fw pi-globe',
                                to: '/landing'
                            },
                            {
                                label: 'Auth',
                                icon: 'pi pi-fw pi-user',
                                items: [
                                    {
                                        label: 'Login',
                                        icon: 'pi pi-fw pi-sign-in',
                                        // to: '/landing/login'
                                        to: '/login'
                                    },
                                    {
                                        label: 'Error',
                                        icon: 'pi pi-fw pi-times-circle',
                                        to: '/landing/error'
                                    },
                                    {
                                        label: 'Access Denied',
                                        icon: 'pi pi-fw pi-lock',
                                        to: '/landing/access'
                                    },
                                    {
                                        label: 'Register',
                                        icon: 'pi pi-fw pi-user-plus',
                                        to: '/landing/register'
                                    },
                                    {
                                        label: 'Forgot Password',
                                        icon: 'pi pi-fw pi-question',
                                        // to: '/landing/forgot-password'
                                        to: '/forgot-password'
                                    },
                                    {
                                        label: 'New Password',
                                        icon: 'pi pi-fw pi-cog',
                                        to: '/landing/new-password'
                                    },
                                    {
                                        label: 'Verification',
                                        icon: 'pi pi-fw pi-envelope',
                                        to: '/landing/verification'
                                    },
                                    {
                                        label: 'Lock Screen',
                                        icon: 'pi pi-fw pi-eye-slash',
                                        to: '/landing/lock-screen'
                                    }
                                ]
                            },

                            {
                                label: 'Crud',
                                icon: 'pi pi-fw pi-pencil',
                                to: '/pages/crud'
                            },
                            {
                                label: 'Invoice',
                                icon: 'pi pi-fw pi-dollar',
                                to: '/pages/invoice'
                            },
                            {
                                label: 'About Us',
                                icon: 'pi pi-fw pi-user',
                                to: '/pages/aboutus'
                            },
                            {
                                label: 'Help',
                                icon: 'pi pi-fw pi-question-circle',
                                to: '/pages/help'
                            },
                            {
                                label: 'Oops',
                                icon: 'pi pi-fw pi-exclamation-circle',
                                to: '/landing/oops'
                            },
                            {
                                label: 'Not Found',
                                icon: 'pi pi-fw pi-exclamation-circle',
                                to: '/pages/notfound'
                            },
                            {
                                label: 'Empty',
                                icon: 'pi pi-fw pi-circle-off',
                                to: '/pages/empty'
                            },
                            {
                                label: 'FAQ',
                                icon: 'pi pi-fw pi-question',
                                to: '/pages/faq'
                            },
                            {
                                label: 'Contact Us',
                                icon: 'pi pi-fw pi-phone',
                                to: '/landing/contact'
                            }
                        ]
                    }
                ]
            }
        ]
    }
]);

const secciones = ref([
    {
        label: 'Dashboard',
        translatable: 'navigation.home.label',
        icon: 'pi pi-home',
        to: '/'
    },
    {
        label: 'Entities',
        translatable: 'navigation.entities.label',
        icon: 'pi pi-building',
        to: '/entities'
    },
    // { separator: true },
    {
        label: 'Suscripciones',
        icon: 'pi pi-sync',
        to: '/subscriptions'
    },
    // { separator: true },
    {
        label: 'Contratos',
        icon: 'pi pi-calendar-clock',
        to: '/entities_subscriptions'
    },
    // { separator: true },
    {
        label: 'Facturas',
        icon: 'pi pi-file',
        to: '/invoices'
    },
    // { separator: true },
    {
        label: 'Usuarios',
        icon: 'pi pi-user',
        to: '/users'
    },
    // { separator: true },
    {
        label: 'Configuración',
        icon: 'pi pi-cog',
        to: '/configuration'
    }
]);

const model = ref([...(useHorizontal.value ? secciones.value : [{ items: secciones.value }]), ...(usePlantilla.value ? plantilla.value : [])]);

watch(
    () => layoutConfig.menuMode,
    (newValue) => {
        useHorizontal.value = secondaryMenuStyle.value.includes(newValue);
        model.value = [...(useHorizontal.value ? secciones.value : [{ items: secciones.value }]), ...(usePlantilla.value ? plantilla.value : [])];
    }
);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <AppMenuItem v-if="!item.separator" :item="item" root :index="i" />

            <li v-else class="menu-separator" />
        </template>
    </ul>
</template>
