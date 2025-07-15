export default defineNuxtPlugin(async () => {
    const { useWebAppViewport, useWebAppTheme } = await import('vue-tg');

    const { expand, disableVerticalSwipes } = useWebAppViewport();
    const { setHeaderColor, setBackgroundColor } = useWebAppTheme();

    expand();
    disableVerticalSwipes();

    const root = document.documentElement;
    const style = window.getComputedStyle(root);

    setHeaderColor(style.getPropertyValue('--color-app-bg'));
    setBackgroundColor(style.getPropertyValue('--color-app-bg'));

    // root.style.setProperty(
    //     '--test-color',
    //     adjust(style.getPropertyValue('--tg-theme-bg-color') || '', -13)
    // );
});
