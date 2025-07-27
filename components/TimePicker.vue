<template>
    <div>
        <div
            @click="openModal"
            class="w-full px-3 py-2 rounded-2xl bg-app-bg-accented cursor-pointer flex items-center justify-between border border-app-border-accented"
        >
            <div class="flex items-center gap-2">
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span>
                    {{ selectedTime || '' }}
                </span>
            </div>
            <svg
                class="w-5 h-5 transition-transform"
                :class="{ 'rotate-180': isModalOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
        </div>

        <div
            v-if="isModalOpen"
            class="fixed inset-0 z-50 flex flex-col gap-2 items-center justify-center bg-black/30 bg-opacity backdrop-blur-md p-5"
            @click="closeModal"
        >
            <div
                class="bg-app-bg-accented border border-app-border-accented rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                @click.stop
            >
                <div>
                    <div class="flex text-2xl font-medium">
                        <div class="flex-1">
                            <div class="h-96 overflow-y-auto" ref="hoursColumn">
                                <div class="py-8">
                                    <div
                                        v-for="hour in hours"
                                        :key="hour"
                                        @click="selectHour(hour)"
                                        class="h-10 flex items-center justify-center cursor-pointer transition-colors"
                                        :class="
                                            selectedHour === hour
                                                ? 'bg-primary text-app-bg-accented'
                                                : 'hover:bg-app-primary/15'
                                        "
                                    >
                                        {{ hour.toString().padStart(2, '0') }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex-1">
                            <div
                                class="h-96 overflow-y-auto"
                                ref="minutesColumn"
                            >
                                <div class="py-8">
                                    <div
                                        v-for="minute in minutes"
                                        :key="minute"
                                        @click="selectMinute(minute)"
                                        class="h-10 flex items-center justify-center cursor-pointer transition-colors"
                                        :class="
                                            selectedMinute === minute
                                                ? 'bg-app-primary text-app-bg-accented'
                                                : 'hover:bg-app-primary/15'
                                        "
                                    >
                                        {{ minute.toString().padStart(2, '0') }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
    change: [value: string];
    close: [];
    open: [];
}>();

const isModalOpen = ref(false);
const selectedHour = ref(12);
const selectedMinute = ref(0);
const selectedTime = ref(props.modelValue);

const hoursColumn = ref<HTMLElement | null>(null);
const minutesColumn = ref<HTMLElement | null>(null);

const hours = computed(() => Array.from({ length: 24 }, (_, i) => i));

const minutes = computed(() => Array.from({ length: 60 }, (_, i) => i));

const currentTimeString = computed(() => {
    return `${selectedHour.value
        .toString()
        .padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`;
});

const openModal = () => {
    isModalOpen.value = true;
    emit('open');
    if (selectedTime.value) {
        const [hours, minutes] = selectedTime.value.split(':').map(Number);
        selectedHour.value = hours;
        selectedMinute.value = minutes;
    }
    nextTick(() => {
        scrollToSelected();
    });
};

const closeModal = () => {
    updateSelectedTime();
    isModalOpen.value = false;
    emit('close');
};

const selectHour = (hour: number) => {
    selectedHour.value = hour;
    updateSelectedTime();
};

const selectMinute = (minute: number) => {
    selectedMinute.value = minute;
    updateSelectedTime();
};

const updateSelectedTime = () => {
    const timeString = currentTimeString.value;
    selectedTime.value = timeString;
    emit('update:modelValue', timeString);
    emit('change', timeString);
};

const scrollToSelected = () => {
    const itemHeight = 40;
    const containerHeight = 384;
    const padding = 32;
    const paddingOffset = padding - itemHeight / 2;
    const visibleItems = Math.floor(containerHeight / itemHeight);
    const centerOffset = Math.floor(visibleItems / 2);

    if (hoursColumn.value) {
        const hourIndex = hours.value.indexOf(selectedHour.value);
        const scrollTop = (hourIndex - centerOffset) * itemHeight;
        hoursColumn.value.scrollTop = Math.max(0, scrollTop + paddingOffset);
    }

    if (minutesColumn.value) {
        const minuteIndex = minutes.value.indexOf(selectedMinute.value);
        const scrollTop = (minuteIndex - centerOffset) * itemHeight;
        minutesColumn.value.scrollTop = Math.max(0, scrollTop + paddingOffset);
    }
};

watch(
    () => props.modelValue,
    newValue => {
        selectedTime.value = newValue;
    }
);

onMounted(() => {
    if (!selectedTime.value) {
        const now = new Date();
        selectedHour.value = now.getHours();
        selectedMinute.value = now.getMinutes();
    }
});
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
    width: 0;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: none;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: none;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: none;
}

.overflow-y-auto {
    scroll-behavior: auto;
}
</style>
