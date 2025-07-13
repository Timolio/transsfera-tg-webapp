<script setup lang="ts">
const { useWebApp } = await import('vue-tg');

const { sendData } = useWebApp();

const info = ref('');

const confirm = () => {
    sendData(info.value);
};
</script>

<template>
    <div>
        <input type="text" v-model="info" placeholder="Enter some info" />
        <button @click="confirm">Confirm</button>
    </div>
</template>
