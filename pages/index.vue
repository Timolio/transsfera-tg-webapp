<script setup lang="ts">
import type { FormData } from '~/types/types';
import { today, getLocalTimeZone } from '@internationalized/date';

const { useWebApp, MainButton, BackButton, useWebAppHapticFeedback } =
    await import('vue-tg');

const { sendData } = useWebApp();
const { notificationOccurred } = useWebAppHapticFeedback();

const currentStep = ref(0);
const totalSteps = ref(4);

const isTimeModalOpen = ref(false);
const isLocationModalOpen = ref(false);
const showValidationErrors = ref(false);

const state = reactive<FormData>({
    date: null,
    time: null,
    passengersUnder12: 0,
    passengersOver12: 0,
    from: null,
    to: null,
    name: '',
    phone: '',
});

const confirm = () => {
    const dataToSend = {
        from: state.from,
        to: state.to,
        date: state.date?.toString(),
        time: state.time,
        passengersUnder12: state.passengersUnder12,
        passengersOver12: state.passengersOver12,
        name: state.name,
        phone: state.phone,
    };

    sendData(JSON.stringify(dataToSend));
};

const validateCurrentStep = () => {
    switch (currentStep.value) {
        case 0:
            return state.date && state.time;
        case 1:
            return state.to !== null && state.from !== null;
        case 2:
            return state.passengersUnder12 + state.passengersOver12 > 0;
        case 3:
            return state.name.trim() && state.phone.trim();
        default:
            return true;
    }
};

const nextStep = () => {
    if (validateCurrentStep()) {
        showValidationErrors.value = false;
        if (currentStep.value < totalSteps.value) {
            currentStep.value++;
        } else {
            confirm();
        }
    } else {
        notificationOccurred('error');
        showValidationErrors.value = true;
    }
};

const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
        showValidationErrors.value = false;
    }
};

const minDate = today(getLocalTimeZone());

const shouldShowMainButton = computed(() => {
    return !isTimeModalOpen.value && !isLocationModalOpen.value;
});

const buttonText = computed(() => {
    return currentStep.value === totalSteps.value ? 'Готово' : 'Далее';
});
</script>

<template>
    <div
        class="relative min-h-screen p-5 bg-app-bg max-w-lg mx-auto flex flex-col"
    >
        <div class="mb-8 flex gap-4 items-center sticky top-0">
            <!-- <img class="h-8 w-8" src="/logo.png" /> -->
            <UProgress v-model="currentStep" :max="totalSteps" />
        </div>

        <div class="flex-1 flex flex-col">
            <div v-if="currentStep === 0" class="space-y-6 flex-1">
                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1"
                    >
                        Выберите дату
                        <span
                            v-if="showValidationErrors && !state.date"
                            class="text-red-500"
                        >
                            *
                        </span>
                    </div>
                    <div
                        class="bg-app-bg-accented p-4 rounded-2xl border border-app-border-accented"
                    >
                        <UCalendar
                            v-model="state.date"
                            size="xl"
                            :year-controls="false"
                            :min-value="minDate"
                        />
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1"
                    >
                        Выберите время
                        <span
                            v-if="showValidationErrors && !state.time"
                            class="text-red-500"
                        >
                            *
                        </span>
                    </div>
                    <TimePicker
                        @open="isTimeModalOpen = true"
                        @close="isTimeModalOpen = false"
                        v-model="state.time!"
                    />
                </div>
            </div>

            <div v-if="currentStep === 1" class="space-y-6 flex-1">
                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1"
                    >
                        Откуда
                        <span
                            v-if="showValidationErrors && state.from === null"
                            class="text-red-500"
                        >
                            *
                        </span>
                    </div>
                    <!-- <UInput
                        class="w-full"
                        v-model="state.from"
                        placeholder="Введите пункт отправления"
                        size="xl"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    /> -->
                    <LocationPicker
                        @open="isLocationModalOpen = true"
                        @close="isLocationModalOpen = false"
                        v-model="state.from"
                    />
                </div>

                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1"
                    >
                        Куда
                        <span
                            v-if="showValidationErrors && state.to === null"
                            class="text-red-500"
                        >
                            *
                        </span>
                    </div>
                    <!-- <UInput
                        class="w-full"
                        v-model="state.to"
                        placeholder="Введите пункт назначения"
                        size="xl"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    /> -->
                    <LocationPicker
                        @open="isLocationModalOpen = true"
                        @close="isLocationModalOpen = false"
                        v-model="state.to"
                    />
                </div>
            </div>

            <div v-if="currentStep === 2" class="space-y-6 flex-1">
                <div
                    class="uppercase font-medium text-app-subtitle ml-2 flex items-center gap-1"
                >
                    Количество пассажиров
                    <span
                        v-if="
                            showValidationErrors &&
                            state.passengersUnder12 + state.passengersOver12 ===
                                0
                        "
                        class="text-red-500"
                        >*</span
                    >
                </div>
                <div>
                    <div>
                        <div
                            class="text-sm text-app-subtitle font-medium ml-2 mb-1"
                        >
                            До 12 лет
                        </div>
                        <UInputNumber
                            size="xl"
                            class="w-full"
                            type="number"
                            :ui="{ base: ['rounded-2xl'] }"
                            v-model="state.passengersUnder12"
                            :min="0"
                        />
                    </div>
                </div>
                <div>
                    <div
                        class="text-sm text-app-subtitle font-medium ml-2 mb-1"
                    >
                        От 12 лет
                    </div>
                    <UInputNumber
                        size="xl"
                        class="w-full"
                        type="number"
                        :ui="{ base: ['rounded-2xl'] }"
                        v-model="state.passengersOver12"
                        :min="0"
                    />
                </div>
            </div>

            <div v-if="currentStep === 3" class="space-y-6 flex-1">
                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1 flex items-center gap-1"
                    >
                        Имя
                        <span
                            v-if="showValidationErrors && !state.name.trim()"
                            class="text-red-500"
                            >*</span
                        >
                    </div>
                    <UInput
                        class="w-full"
                        v-model="state.name"
                        placeholder="Введите ваше имя"
                        size="xl"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    />
                </div>

                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1 flex items-center gap-1"
                    >
                        Телефон
                        <span
                            v-if="showValidationErrors && !state.phone.trim()"
                            class="text-red-500"
                            >*</span
                        >
                    </div>
                    <UInput
                        class="w-full"
                        v-model="state.phone"
                        placeholder="Введите номер телефона"
                        size="xl"
                        type="tel"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    />
                </div>
            </div>

            <div v-if="currentStep === 4" class="space-y-6 flex-1">
                <div class="p-3 rounded-2xl border border-app-border-accented">
                    <div class="flex items-center gap-2 text-app-subtitle">
                        <Icon
                            name="heroicons:information-circle"
                            class="w-5 h-5"
                        />
                        <span class="text-sm font-medium">
                            Проверьте введенные данные перед отправкой!
                        </span>
                    </div>
                </div>
                <div class="space-y-2">
                    <div>
                        <strong>Дата:</strong> {{ state.date?.toString() }}
                    </div>
                    <div><strong>Время:</strong> {{ state.time }}</div>
                    <div><strong>Откуда:</strong> {{ state.from }}</div>
                    <div><strong>Куда:</strong> {{ state.to }}</div>
                    <div>
                        <strong>Пассажиров до 12 лет:</strong>
                        {{ state.passengersUnder12 }}
                    </div>
                    <div>
                        <strong>Пассажиров от 12 лет:</strong>
                        {{ state.passengersOver12 }}
                    </div>
                    <div><strong>Имя:</strong> {{ state.name }}</div>
                    <div><strong>Телефон:</strong> {{ state.phone }}</div>
                </div>
            </div>

            <button @click="nextStep" v-if="shouldShowMainButton">
                {{ buttonText }}
            </button>
        </div>
    </div>

    <MainButton
        :text="buttonText"
        :visible="shouldShowMainButton"
        @click="nextStep"
        color="#e7c380"
    />
    <BackButton :visible="currentStep > 0" @click="prevStep" />
</template>
