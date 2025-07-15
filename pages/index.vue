<script setup lang="ts">
import type { FormData } from '~/types/types';

const { useWebApp, MainButton } = await import('vue-tg');

const { sendData } = useWebApp();

const currentStep = ref(0);
const totalSteps = ref(3);

const formData = ref<FormData>({
    date: null,
    time: null,
});

const confirm = () => {
    if (canProceed.value)
        sendData(formData.value.date?.toString() + ', ' + formData.value.time);
    else sendData('No date selected');
};

const canProceed = computed(() => {
    switch (currentStep.value) {
        case 0:
            return formData.value.date && formData.value.time;
        default:
            return true;
    }
});
</script>

<template>
    <div class="min-h-screen p-5 bg-app-bg text-tg-text">
        <div class="max-w-lg mx-auto">
            <div class="mb-8">
                <UProgress v-model="currentStep" :max="totalSteps" />
            </div>
            <div v-if="currentStep === 0" class="space-y-6">
                <div
                    class="bg-tg-bg p-4 rounded-2xl border border-tg-secondary-bg"
                >
                    <UCalendar
                        v-model="formData.date"
                        size="xl"
                        :year-controls="false"
                    />
                </div>
                <div v-if="formData.date">
                    <UInput size="xl" v-model="formData.time" type="time" />
                </div>
            </div>
        </div>
    </div>
    <MainButton :visible="!!canProceed" text="Confirm" @click="confirm" />
</template>
