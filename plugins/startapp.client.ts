export default defineNuxtPlugin(async () => {
    const { useWebAppViewport, useWebAppTheme } = await import('vue-tg');

    const { expand, disableVerticalSwipes } = useWebAppViewport();
    const { setHeaderColor, themeParams } = useWebAppTheme();

    expand();
    disableVerticalSwipes();

    const root = document.documentElement;
    const style = window.getComputedStyle(root);

    root.style.setProperty(
        '--app-bg-color',
        adjust(style.getPropertyValue('--tg-theme-bg-color') || '', -10)
    );

    setHeaderColor(style.getPropertyValue('--app-bg-color') || '');
});
