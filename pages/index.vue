<script setup lang="ts">
const { useWebApp } = await import('vue-tg');

const { sendData } = useWebApp();

const info = ref('');

const confirm = () => {
    sendData(info.value);
};
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-between p-4">
        <input
            class="p-4 rounded-2xl border-2 border-gray-300 w-full max-w-md text-2xl"
            type="text"
            v-model="info"
            placeholder="Enter some info"
        />
        <button
            class="bg-amber-500 p-4 rounded-2xl w-full max-w-md text-white font-semibold text-2xl"
            @click="confirm"
        >
            Confirm
        </button>
    </div>
</template>
