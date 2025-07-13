export default defineNuxtPlugin(async () => {
    const { useWebAppViewport } = await import('vue-tg');
    const { expand, disableVerticalSwipes } = useWebAppViewport();
    expand();
    disableVerticalSwipes();
});
