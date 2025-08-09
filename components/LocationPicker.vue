<template>
    <div>
        <div
            @click="openMap"
            class="w-full px-3 py-2 rounded-2xl bg-app-bg-accented cursor-pointer flex items-center justify-between border border-app-border-accented"
        >
            <div class="flex items-center gap-2">
                <UIcon
                    name="i-lucide-map-pin"
                    class="size-5 shrink-0 text-app-subtitle"
                />
                <span class="text-base">
                    {{ selectedAddress || placeholder }}
                </span>
            </div>
            <UIcon
                name="i-lucide-chevron-right"
                class="size-5 shrink-0 text-app-subtitle"
            />
        </div>

        <div
            v-if="isMapOpen"
            class="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-md p-4"
            @click="closeMap"
        >
            <div @click.stop>
                <UInput
                    ref="searchInput"
                    size="xl"
                    v-model="searchQuery"
                    @input="handleSearch"
                    placeholder="Поиск..."
                    class="w-full"
                    :ui="{
                        base: 'rounded-2xl',
                    }"
                    icon="i-lucide-search"
                />

                <div
                    class="mt-2 bg-app-bg-accented rounded-2xl border border-app-border-accented max-h-100 overflow-y-auto"
                >
                    <div
                        class="px-3 py-2 cursor-pointer flex items-center gap-2 border-b border-app-border-accented last:border-none"
                        v-if="searchQuery.trim()"
                        @click="confirmCustomAddress"
                    >
                        <UIcon
                            name="i-lucide-map-pin"
                            class="size-5 shrink-0 text-app-subtitle"
                        />
                        <div>
                            <span class="font-medium">{{ searchQuery }}</span>
                        </div>
                    </div>
                    <div
                        v-for="result in searchResults"
                        :key="result.place_id"
                        @click="selectSearchResult(result)"
                        class="px-3 py-2 cursor-pointer flex items-center gap-2 border-b border-app-border-accented last:border-none"
                    >
                        <UIcon
                            name="i-lucide-map-pin"
                            class="size-5 shrink-0 text-app-subtitle"
                        />
                        <div class="font-medium">
                            {{ result.display_name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue?: string | null;
    placeholder?: string;
}

interface SearchResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Выберите адрес',
});

const emit = defineEmits<{
    'update:modelValue': [value: string | null];
    change: [value: string | null];
    open: [];
    close: [];
}>();

const isMapOpen = ref(false);
const searchQuery = ref('');
const searchResults = ref<SearchResult[]>([]);
const selectedAddress = ref(props.modelValue || '');
// const selectedCoordinates = ref<[number, number] | null>(
//     props.modelValue?.coordinates || null
// );

const searchInput = ref();

let searchTimeout: NodeJS.Timeout | null = null;

const handleSearch = async () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    if (!searchQuery.value.trim()) {
        searchResults.value = [];
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery.value
                )}&limit=5&addressdetails=1&accept-language=ru`
            );
            const data = await response.json();
            searchResults.value = data;
        } catch (error) {
            console.error('Ошибка поиска:', error);
            searchResults.value = [];
        }
    }, 500);
};

const selectSearchResult = (result: SearchResult) => {
    // const lat = parseFloat(result.lat);
    // const lng = parseFloat(result.lon);

    // selectedCoordinates.value = [lat, lng];
    selectedAddress.value = result.display_name;
    searchResults.value = [];
    searchQuery.value = '';

    updateModelValue();
    closeMap();
};

const confirmCustomAddress = () => {
    selectedAddress.value = searchQuery.value.trim();
    searchResults.value = [];
    searchQuery.value = '';

    updateModelValue();
    closeMap();
};

const updateModelValue = () => {
    if (selectedAddress.value) {
        // const locationData: LocationData = {
        //     address: selectedAddress.value,
        //     coordinates: selectedCoordinates.value,
        // };

        emit('update:modelValue', selectedAddress.value);
        emit('change', selectedAddress.value);
    }
};

const openMap = () => {
    isMapOpen.value = true;
    emit('open');
    nextTick(() => {
        if (searchInput.value) {
            searchInput.value.$el.getElementsByTagName('input')[0].focus();
        }
    });
};

const closeMap = () => {
    isMapOpen.value = false;
    searchResults.value = [];
    searchQuery.value = '';

    if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
    }

    emit('close');
};

watch(
    () => props.modelValue,
    newValue => {
        if (newValue) {
            selectedAddress.value = newValue;
            // selectedCoordinates.value = newValue.coordinates;
        }
    },
    { deep: true }
);
</script>
