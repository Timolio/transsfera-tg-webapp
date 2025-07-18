<script setup lang="ts">
import type { FormData } from '~/types/types';
import { today, getLocalTimeZone } from '@internationalized/date';
import { isValidPhoneNumber } from 'libphonenumber-js';

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

const formatDate = (date: any) => {
    if (!date) return '';
    return new Date(date.toString()).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

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
            return state.name.trim() && isValidPhoneNumber(state.phone);
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
                    <LocationPicker
                        @open="isLocationModalOpen = true"
                        @close="isLocationModalOpen = false"
                        v-model="state.to"
                    />
                </div>
            </div>

            <div v-if="currentStep === 2" class="space-y-6 flex-1">
                <div
                    class="uppercase font-medium text-app-subtitle flex items-center gap-1 border-b px-3 py-2 border-app-border-accented"
                >
                    <UIcon name="i-lucide-person-standing" class="size-5" />
                    Кол-во пассажиров
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
                    <div
                        class="text-app-subtitle font-medium ml-2 mb-1 uppercase text-sm"
                    >
                        Старше 12 лет
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

                <div>
                    <div>
                        <div
                            class="text-app-subtitle font-medium ml-2 mb-1 flex items-center gap-2"
                        >
                            <span class="uppercase text-sm"
                                >12 лет и младше</span
                            >
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
                        type=""
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
                            v-if="
                                showValidationErrors &&
                                !isValidPhoneNumber(state.phone)
                            "
                            class="text-red-500"
                            >*</span
                        >
                    </div>
                    <UInput
                        class="w-full"
                        v-model="state.phone"
                        placeholder="Нарпример: +44 123 456 7890"
                        size="xl"
                        type="text"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    />
                </div>
            </div>

            <div v-if="currentStep === 4" class="space-y-6 flex-1">
                <div
                    class="uppercase font-medium text-app-subtitle flex items-center gap-1 border-b px-3 py-2 border-app-border-accented"
                >
                    <UIcon name="i-lucide-check-check" class="size-5" />
                    Подтверждение данных
                </div>
                <div class="space-y-4">
                    <div
                        class="bg-app-bg-accented px-3 py-2 rounded-2xl border border-app-border-accented"
                    >
                        <div class="flex items-center gap-3">
                            <UIcon
                                name="i-lucide-calendar"
                                class="w-5 h-5 text-app-subtitle shrink-0"
                            />
                            <p class="uppercase">
                                {{ formatDate(state.date) }} в
                                {{ state.time }}
                            </p>
                        </div>
                    </div>
                    <div
                        class="bg-app-bg-accented px-3 py-2 rounded-2xl border border-app-border-accented"
                    >
                        <div class="flex flex-col gap-2 w-full">
                            <div class="flex gap-2 items-center">
                                <UIcon
                                    name="i-lucide-map-pin"
                                    class="w-5 h-5 text-app-subtitle shrink-0"
                                />
                                <p>
                                    {{ state.from?.address }}
                                </p>
                            </div>
                            <USeparator
                                :ui="{
                                    border: 'border-app-subtitle/20',
                                }"
                            />
                            <div class="flex gap-2 items-center">
                                <UIcon
                                    name="i-lucide-map-pin"
                                    class="w-5 h-5 text-app-subtitle shrink-0"
                                />
                                <p>
                                    {{ state.to?.address }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        class="bg-app-bg-accented px-3 py-2 rounded-2xl border border-app-border-accented"
                    >
                        <div class="flex items-center gap-2">
                            <UIcon
                                name="i-lucide-users"
                                class="w-5 h-5 text-app-subtitle shrink-0"
                            />
                            <p class="uppercase">
                                <strong>{{
                                    state.passengersOver12 +
                                    state.passengersUnder12
                                }}</strong>
                            </p>
                        </div>
                        <div class="flex items-center gap-4">
                            <UIcon
                                name="i-lucide-corner-down-right"
                                class="w-5 h-5 text-app-subtitle shrink-0 ml-1"
                            />
                            <p class="uppercase flex items-center gap-2">
                                <UIcon
                                    name="i-lucide-baby"
                                    class="w-5 h-5 text-app-subtitle shrink-0"
                                />
                                <strong>{{ state.passengersUnder12 }}</strong>
                            </p>
                        </div>
                    </div>
                    <div
                        class="bg-app-bg-accented px-3 py-2 rounded-2xl border border-app-border-accented"
                    >
                        <div class="flex items-center gap-3">
                            <UIcon
                                name="i-lucide-phone"
                                class="w-5 h-5 text-app-subtitle shrink-0"
                            />
                            <div class="flex flex-col">
                                <p class="uppercase">
                                    {{ state.name }}
                                </p>
                                <p>{{ state.phone }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- <button @click="nextStep" v-if="shouldShowMainButton">
                {{ buttonText }}
            </button> -->
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
