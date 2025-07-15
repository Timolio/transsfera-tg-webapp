<script setup lang="ts">
import type { FormData } from '~/types/types';

const { useWebApp, MainButton, BackButton } = await import('vue-tg');

const { sendData } = useWebApp();

const currentStep = ref(0);
const totalSteps = ref(3);

const formData = ref<FormData>({
    date: null,
    time: null,
    passengers: 1,
    from: '',
    to: '',
});

const confirm = () => {
    const dataToSend = {
        from: formData.value.from,
        to: formData.value.to,
        date: formData.value.date?.toString(),
        time: formData.value.time,
        passengers: formData.value.passengers,
        timestamp: new Date().toString(),
    };

    sendData(JSON.stringify(dataToSend));
};

const canProceed = computed(() => {
    switch (currentStep.value) {
        case 0:
            return formData.value.date && formData.value.time;
        case 1:
            return formData.value.from.trim() && formData.value.to.trim();
        case 2:
            return formData.value.passengers > 0;
        default:
            return true;
    }
});

const nextStep = () => {
    if (currentStep.value < totalSteps.value - 1) {
        currentStep.value++;
    } else {
        confirm();
    }
};

const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};

const buttonText = computed(() => {
    return currentStep.value === totalSteps.value - 1 ? 'Готово' : 'Далее';
});
</script>

<template>
    <div class="min-h-screen p-5 bg-app-bg max-w-lg mx-auto flex flex-col">
        <div class="mb-6">
            <UProgress status v-model="currentStep" :max="totalSteps" />
        </div>

        <div class="flex-1 flex flex-col">
            <div v-if="currentStep === 0" class="space-y-6 flex-1">
                <div class="p-3 rounded-2xl border border-app-border-accented">
                    <div class="flex items-center space-x-2 text-app-subtitle">
                        <Icon
                            name="heroicons:information-circle"
                            class="w-4 h-4 text-app-primary"
                        />
                        <span class="text-sm">
                            Дату и время указывайте по 🇪🇸 времени!
                        </span>
                    </div>
                </div>
                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1"
                    >
                        Выберите дату
                    </div>
                    <div
                        class="bg-app-bg-accented p-4 rounded-2xl border border-app-border-accented"
                    >
                        <UCalendar
                            v-model="formData.date"
                            size="xl"
                            :year-controls="false"
                        />
                    </div>
                </div>

                <div v-if="formData.date" class="flex items-center gap-3">
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1"
                    >
                        Выберите время
                    </div>
                    <div
                        class="bg-app-bg-accented focus-within:ring-2 ring-app-primary rounded-2xl border border-app-border-accented px-3 py-2"
                    >
                        <input
                            class="w-full outline-none"
                            type="time"
                            v-model="formData.time"
                        />
                    </div>
                    <!-- <UInput
                        class="w-full"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                        size="xl"
                        v-model="formData.time"
                        type="time"
                    /> -->
                </div>
            </div>

            <div v-if="currentStep === 1" class="space-y-6 flex-1">
                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-2"
                    >
                        Откуда
                    </div>
                    <UInput
                        class="w-full"
                        v-model="formData.from"
                        placeholder="Введите адрес отправления"
                        size="xl"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    />
                </div>

                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-2"
                    >
                        Куда
                    </div>
                    <UInput
                        class="w-full"
                        v-model="formData.to"
                        placeholder="Введите адрес назначения"
                        size="xl"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    />
                </div>
            </div>

            <div v-if="currentStep === 2" class="space-y-6 flex-1">
                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-2"
                    >
                        Количество пассажиров
                    </div>
                    <UInputNumber
                        size="xl"
                        class="w-full"
                        type="number"
                        :ui="{ base: ['rounded-2xl'] }"
                    />
                </div>
            </div>
        </div>
    </div>

    <MainButton
        :text="buttonText"
        :visible="!!canProceed"
        @click="nextStep"
        color="#e7c380"
    />
    <BackButton :visible="currentStep > 0" @click="prevStep" />
</template>
