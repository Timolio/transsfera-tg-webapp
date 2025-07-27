<script setup lang="ts">
import type { OrderData } from '~/types/types';
import { today, getLocalTimeZone } from '@internationalized/date';
import { isValidPhoneNumber } from 'libphonenumber-js';

const { useWebApp, MainButton, BackButton, useWebAppHapticFeedback } =
    await import('vue-tg');

const { sendData } = useWebApp();
const { notificationOccurred } = useWebAppHapticFeedback();

const currentStep = ref(0);
const totalSteps = ref(5);

const isTimeModalOpen = ref(false);
const isLocationModalOpen = ref(false);
const showValidationErrors = ref(false);

const state = reactive<OrderData>({
    date: null,
    time: null,
    from_location: null,
    to_location: null,
    children: 0,
    adults: 0,
    baggage: 0,
    name: '',
    phone: '',
    hasTelegram: false,
    hasWhatsApp: false,
    hasViber: false,
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
        from_location: state.from_location,
        to_location: state.to_location,
        date: state.date?.toString(),
        time: state.time,
        children: state.children,
        adults: state.adults,
        baggage: state.baggage,
        name: state.name,
        phone: state.phone,
        hasTelegram: state.hasTelegram,
        hasWhatsApp: state.hasWhatsApp,
        hasViber: state.hasViber,
    };

    sendData(JSON.stringify(dataToSend));
};

const validateCurrentStep = () => {
    switch (currentStep.value) {
        case 0:
            return state.date && state.time;
        case 1:
            return state.to_location !== null && state.from_location !== null;
        case 2:
            return state.children + state.adults > 0;
        case 3:
            return true;
        case 4:
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
        isTimeModalOpen.value = false;
        isLocationModalOpen.value = false;
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

        <!-- Date and time -->
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

            <!-- Route -->
            <div v-if="currentStep === 1" class="space-y-6 flex-1">
                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1"
                    >
                        Откуда
                        <span
                            v-if="
                                showValidationErrors &&
                                state.from_location === null
                            "
                            class="text-red-500"
                        >
                            *
                        </span>
                    </div>
                    <LocationPicker
                        @open="isLocationModalOpen = true"
                        @close="isLocationModalOpen = false"
                        v-model="state.from_location"
                    />
                </div>

                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1"
                    >
                        Куда
                        <span
                            v-if="
                                showValidationErrors &&
                                state.to_location === null
                            "
                            class="text-red-500"
                        >
                            *
                        </span>
                    </div>
                    <LocationPicker
                        @open="isLocationModalOpen = true"
                        @close="isLocationModalOpen = false"
                        v-model="state.to_location"
                    />
                </div>
            </div>

            <!-- Passengers -->
            <div v-if="currentStep === 2" class="space-y-6 flex-1">
                <div
                    class="uppercase font-medium text-app-subtitle flex items-center gap-1 border-b px-3 py-2 border-app-border-accented"
                >
                    <UIcon name="i-lucide-person-standing" class="size-5" />
                    Кол-во пассажиров
                    <span
                        v-if="
                            showValidationErrors &&
                            state.children + state.adults === 0
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
                        v-model="state.adults"
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
                            v-model="state.children"
                            :min="0"
                        />
                    </div>
                </div>
            </div>

            <!-- Baggage -->
            <div v-if="currentStep === 3" class="space-y-6 flex-1">
                <div
                    class="uppercase font-medium text-app-subtitle flex items-center gap-1 border-b px-3 py-2 border-app-border-accented"
                >
                    <UIcon name="i-lucide-luggage" class="size-5" />
                    Кол-во багажа
                    <span v-if="showValidationErrors" class="text-red-500"
                        >*</span
                    >
                </div>

                <div>
                    <UInputNumber
                        size="xl"
                        class="w-full"
                        type="number"
                        :ui="{ base: ['rounded-2xl'] }"
                        :min="0"
                        v-model="state.baggage"
                    />
                </div>
            </div>

            <!-- Contact -->
            <div v-if="currentStep === 4" class="space-y-6 flex-1">
                <div
                    class="uppercase font-medium text-app-subtitle flex items-center gap-1 border-b px-3 py-2 border-app-border-accented"
                >
                    <UIcon name="i-lucide-user" class="size-5" />
                    Контактные данные
                </div>

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
                        placeholder="Ваше имя"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    />
                </div>

                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1 flex items-center gap-1"
                    >
                        Номер телефона
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
                        placeholder="+44 123 456 7890"
                        size="xl"
                        type="tel"
                        :ui="{
                            base: 'rounded-2xl',
                        }"
                    />
                </div>
                <div>
                    <div
                        class="uppercase font-medium text-app-subtitle ml-2 mb-1 flex items-center gap-1"
                    >
                        Способы связи
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <label
                            class="flex flex-col items-center gap-1.5 px-3 py-2 rounded-s-2xl rounded-e-xl cursor-pointer transition-all duration-100 ring ring-inset ring-app-border-accented"
                            :class="
                                state.hasWhatsApp
                                    ? 'ring-green-500 ring-2 bg-green-500/10 text-white'
                                    : 'text-app-subtitle'
                            "
                        >
                            <input
                                name="whatsapp"
                                type="checkbox"
                                v-model="state.hasWhatsApp"
                                class="sr-only"
                            />
                            <div
                                class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center"
                            >
                                <UIcon
                                    name="i-simple-icons-whatsapp"
                                    class="size-6 text-white"
                                />
                            </div>
                            <!-- <span class="text-sm">WhatsApp</span> -->
                        </label>

                        <label
                            class="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-100 ring ring-inset ring-app-border-accented"
                            :class="
                                state.hasTelegram
                                    ? 'ring-blue-500 ring-2 bg-blue-500/10 text-white'
                                    : 'text-app-subtitle'
                            "
                        >
                            <input
                                name="telegram"
                                type="checkbox"
                                v-model="state.hasTelegram"
                                class="sr-only"
                            />
                            <div
                                class="flex items-center justify-center relative"
                            >
                                <div
                                    class="absolute rounded-full h-7 w-7 bg-white"
                                ></div>
                                <UIcon
                                    name="i-simple-icons-telegram"
                                    class="size-9 text-blue-500"
                                />
                            </div>
                            <!-- <span class="text-sm">Telegram</span> -->
                        </label>

                        <label
                            class="flex flex-col items-center gap-1.5 px-3 py-2 rounded-e-2xl rounded-s-xl cursor-pointer transition-all duration-100 ring ring-inset ring-app-border-accented"
                            :class="
                                state.hasViber
                                    ? 'ring-purple-500 ring-2 bg-purple-500/10 text-white'
                                    : 'text-app-subtitle'
                            "
                        >
                            <input
                                name="viber"
                                type="checkbox"
                                v-model="state.hasViber"
                                class="sr-only"
                            />
                            <div
                                class="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center"
                            >
                                <UIcon
                                    name="i-simple-icons-viber"
                                    class="size-6 text-white"
                                />
                            </div>
                            <!-- <span class="text-sm">Viber</span> -->
                        </label>
                    </div>
                </div>
            </div>

            <!-- Overview -->
            <div v-if="currentStep === 5" class="space-y-6 flex-1">
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
                        class="bg-app-bg-accented px-3 py-3 rounded-2xl border border-app-border-accented"
                    >
                        <div class="flex gap-2">
                            <div class="flex flex-col items-center">
                                <div
                                    class="w-2 h-2 rounded-full bg-app-subtitle mt-1"
                                ></div>

                                <div
                                    class="flex-1 border-1 border-dashed border-app-subtitle/30 my-1"
                                ></div>

                                <UIcon
                                    name="i-lucide-map-pin"
                                    class="w-5 h-5 text-app-subtitle"
                                />
                            </div>

                            <div class="flex flex-col gap-3 justify-between">
                                <p>
                                    {{ state.from_location }}
                                </p>
                                <USeparator />
                                <p>
                                    {{ state.to_location }}
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
                                    state.adults + state.children
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
                                <strong>{{ state.children }}</strong>
                            </p>
                        </div>
                    </div>
                    <div
                        class="bg-app-bg-accented px-3 py-2 rounded-2xl border border-app-border-accented"
                    >
                        <div class="flex items-center gap-2">
                            <UIcon
                                name="i-lucide-luggage"
                                class="w-5 h-5 text-app-subtitle shrink-0"
                            />
                            <p class="uppercase">
                                <strong>{{ state.baggage }}</strong>
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
                                <div class="flex gap-2 items-center">
                                    {{ state.phone }}
                                    <div
                                        v-if="state.hasWhatsApp"
                                        class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                                    >
                                        <UIcon
                                            name="i-simple-icons-whatsapp"
                                            class="size-3 text-white"
                                        />
                                    </div>
                                    <div
                                        v-if="state.hasTelegram"
                                        class="flex items-center justify-center relative"
                                    >
                                        <div
                                            class="absolute rounded-full h-3 w-3 bg-white"
                                        ></div>
                                        <UIcon
                                            name="i-simple-icons-telegram"
                                            class="size-5 text-blue-500"
                                        />
                                    </div>
                                    <div
                                        v-if="state.hasViber"
                                        class="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                                    >
                                        <UIcon
                                            name="i-simple-icons-viber"
                                            class="size-3 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 
            <button @click="nextStep" v-if="shouldShowMainButton">
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
