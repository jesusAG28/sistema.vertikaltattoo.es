import { computed, reactive, ref } from 'vue';

const layoutConfig = reactive({
    preset: 'Aura',
    primary: 'blue',
    darkTheme: false,
    menuMode: 'drawer'
});

const secondaryMenuStyle = ref(['horizontal', 'slim', 'compact']);

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    rightMenuVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    searchBarActive: false,
    sidebarActive: false,
    anchored: false,
    activeMenuItem: null,
    overlaySubmenuActive: false
});

export function useLayout() {
    const setActiveMenuItem = (item) => {
        layoutState.activeMenuItem = item.value || item;
    };

    const toggleMenu = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const toggleConfigSidebar = () => {
        if (isSidebarActive.value) {
            layoutState.overlayMenuActive = false;
            layoutState.overlaySubmenuActive = false;
            layoutState.staticMenuMobileActive = false;
            layoutState.menuHoverActive = false;
            layoutState.configSidebarVisible = false;
        }

        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
    };

    const isDarkTheme = computed(() => layoutConfig.darkTheme);
    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive || layoutState.overlaySubmenuActive);
    const isDesktop = computed(() => window.innerWidth > 991);
    const isSlim = computed(() => layoutConfig.menuMode === 'slim');
    const isHorizontal = computed(() => layoutConfig.menuMode === 'horizontal');
    const isOverlay = computed(() => layoutConfig.menuMode === 'overlay');
    const isCompact = computed(() => layoutConfig.menuMode === 'compact');
    const isStatic = computed(() => layoutConfig.menuMode === 'static');
    const isReveal = computed(() => layoutConfig.menuMode === 'reveal');
    const isDrawer = computed(() => layoutConfig.menuMode === 'drawer');

    const bodyBackgroundPalette = {
        light: {
            noir: 'linear-gradient(180deg, #F4F4F5 0%, rgba(212, 212, 216, 0.12) 100%)',
            blue: 'linear-gradient(180deg, #e0e7f5 0%, rgba(170, 194, 239, 0.06) 111.26%)',
            green: 'linear-gradient(180deg, #e0f5e1 0%, rgba(170, 239, 172, 0.06) 111.26%)',
            violet: 'linear-gradient(180deg, #e9e0f5 0%, rgba(198, 170, 239, 0.06) 111.26%)',
            orange: 'linear-gradient(180deg, #f5e9e0 0%, rgba(239, 199, 170, 0.06) 111.26%)',
            rose: 'linear-gradient(180deg, #f5e0e3 0%, rgba(239, 170, 180, 0.06) 111.26%)',
            cyan: 'linear-gradient(180deg, #e0f2f5 0%, rgba(170, 229, 239, 0.06) 111.26%)',
            pink: 'linear-gradient(180deg, #f5e0eb 0%, rgba(239, 170, 205, 0.06) 111.26%)',
            red: 'linear-gradient(180deg, #f5e0e0 0%, rgba(239, 170, 170, 0.06) 111.26%)',
            amber: 'linear-gradient(180deg, #f5ede0 0%, rgba(239, 214, 170, 0.06) 111.26%)',
            yellow: 'linear-gradient(180deg, #f5f0e0 0%, rgba(239, 222, 170, 0.06) 111.26%)',
            lime: 'linear-gradient(180deg, #edf5e0 0%, rgba(212, 239, 170, 0.06) 111.26%)',
            emerald: 'linear-gradient(180deg, #e0f5ee 0%, rgba(170, 239, 216, 0.06) 111.26%)',
            teal: 'linear-gradient(180deg, #e0f5f3 0%, rgba(170, 239, 231, 0.06) 111.26%)',
            sky: 'linear-gradient(180deg, #e0eef5 0%, rgba(170, 217, 239, 0.06) 111.26%)',
            purple: 'linear-gradient(180deg, #ebe0f5 0%, rgba(206, 170, 239, 0.06) 111.26%)',
            fuchsia: 'linear-gradient(180deg, #f2e0f5 0%, rgba(230, 170, 239, 0.06) 111.26%)',
            indigo: 'linear-gradient(180deg, #e0e1f5 0%, rgba(170, 171, 239, 0.06) 111.26%)'
        },
        dark: {
            noir: '#09090b',
            blue: '#000C23',
            green: '#00231B',
            violet: '#0E0023',
            orange: '#231500',
            rose: '#230023',
            cyan: '#001E23',
            pink: '#230012',
            red: '#230000',
            amber: '#231600',
            yellow: '#231B00',
            lime: '#152300',
            emerald: '#002318',
            teal: '#00231F',
            sky: '#001823',
            purple: '#120023',
            fuchsia: '#1F0023',
            indigo: '#000123'
        }
    };

    const updateBodyBackground = (color) => {
        const root = document.documentElement;
        const colorScheme = isDarkTheme.value ? bodyBackgroundPalette.dark : bodyBackgroundPalette.light;
        root.style.setProperty('--surface-ground', colorScheme[color]);
    };

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle('app-dark');
        updateBodyBackground(layoutConfig.primary);
    };

    const handleToggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();

            return;
        }

        document.startViewTransition(() => {
            executeDarkModeToggle();
        });
    };

    return {
        layoutConfig,
        secondaryMenuStyle,
        layoutState,
        isDarkTheme,
        setActiveMenuItem,
        toggleConfigSidebar,
        toggleMenu,
        updateBodyBackground,
        executeDarkModeToggle,
        handleToggleDarkMode,
        isSidebarActive,
        isSlim,
        isHorizontal,
        isCompact,
        isOverlay,
        isStatic,
        isReveal,
        isDrawer,
        isDesktop
    };
}
