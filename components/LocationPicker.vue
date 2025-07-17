<template>
    <div>
        <!-- Кнопка для открытия карты -->
        <div
            @click="openMap"
            class="w-full px-3 py-2 rounded-2xl bg-app-bg-accented cursor-pointer flex items-center justify-between border border-app-border-accented"
        >
            <div class="flex items-center gap-2">
                <svg
                    class="w-5 h-5 text-app-subtitle shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
                <span class="text-base">
                    {{ selectedAddress || placeholder }}
                </span>
            </div>
            <svg
                class="w-5 h-5 text-app-subtitle shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </div>

        <!-- Модальное окно с картой -->
        <div
            v-if="isMapOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
            @click="closeMap"
        >
            <div
                class="bg-app-bg-accented border border-app-border-accented rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col"
                @click.stop
            >
                <!-- Заголовок -->
                <div
                    class="p-4 border-b border-app-border-accented flex items-center justify-between"
                >
                    <h3 class="text-lg font-semibold">{{ title }}</h3>
                    <button
                        @click="closeMap"
                        class="p-2 hover:bg-app-bg rounded-lg transition-colors"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <!-- Поиск -->
                <div class="p-4 border-b border-app-border-accented">
                    <div class="relative">
                        <input
                            v-model="searchQuery"
                            @input="handleSearch"
                            type="text"
                            placeholder="Поиск по адресу..."
                            class="w-full px-4 py-2 rounded-xl bg-app-bg border border-app-border-accented focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                            class="absolute right-3 top-2.5 w-5 h-5 text-app-subtitle"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>

                    <!-- Результаты поиска -->
                    <div
                        v-if="searchResults.length > 0"
                        class="mt-2 bg-app-bg rounded-xl border border-app-border-accented max-h-40 overflow-y-auto"
                    >
                        <div
                            v-for="result in searchResults"
                            :key="result.place_id"
                            @click="selectSearchResult(result)"
                            class="p-3 hover:bg-app-bg-accented cursor-pointer border-b border-app-border-accented last:border-b-0"
                        >
                            <div class="font-medium text-sm">
                                {{ result.display_name }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Контейнер карты -->
                <div class="flex-1 relative">
                    <div ref="mapContainer" class="w-full h-full"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { LocationData } from '~/types/types';

interface Props {
    modelValue?: {
        address: string;
        coordinates: [number, number];
    } | null;
    placeholder?: string;
    title?: string;
}

interface SearchResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Выберите адрес',
    title: 'Выберите местоположение',
});

const emit = defineEmits<{
    'update:modelValue': [value: LocationData | null];
    change: [value: LocationData | null];
    open: [];
    close: [];
}>();

const isMapOpen = ref(false);
const mapContainer = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const searchResults = ref<SearchResult[]>([]);
const selectedAddress = ref(props.modelValue?.address || '');
const selectedCoordinates = ref<[number, number] | null>(
    props.modelValue?.coordinates || null
);

let map: any = null;
let marker: any = null;
let L: any = null;
let searchTimeout: NodeJS.Timeout | null = null;

const loadLeaflet = async () => {
    if (typeof window !== 'undefined' && !L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';

        return new Promise(resolve => {
            script.onload = () => {
                L = (window as any).L;
                resolve(L);
            };
            document.head.appendChild(script);
        });
    }
    return L;
};

const initMap = async () => {
    if (!mapContainer.value) return;

    await loadLeaflet();

    map = L.map(mapContainer.value).setView([55.7558, 37.6176], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    if (selectedCoordinates.value) {
        const [lat, lng] = selectedCoordinates.value;
        map.setView([lat, lng], 15);
        addMarker(lat, lng);
    }

    map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        addMarker(lat, lng);
        selectedCoordinates.value = [lat, lng];
        reverseGeocode(lat, lng);
    });
};

const addMarker = (lat: number, lng: number) => {
    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lng]).addTo(map);
};

const reverseGeocode = async (lat: number, lng: number) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();

        if (data.display_name) {
            selectedAddress.value = data.display_name;
            updateModelValue();
        }
    } catch (error) {
        console.error('Ошибка обратного геокодирования:', error);
    }
};

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
                )}&limit=5&addressdetails=1`
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
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    map.setView([lat, lng], 15);
    addMarker(lat, lng);

    selectedCoordinates.value = [lat, lng];
    selectedAddress.value = result.display_name;
    searchResults.value = [];
    searchQuery.value = '';

    updateModelValue();
};

const updateModelValue = () => {
    if (selectedCoordinates.value && selectedAddress.value) {
        const locationData: LocationData = {
            address: selectedAddress.value,
            coordinates: selectedCoordinates.value,
        };

        emit('update:modelValue', locationData);
        emit('change', locationData);
    }
};

const openMap = () => {
    isMapOpen.value = true;
    emit('open');
    nextTick(() => {
        initMap();
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
            selectedAddress.value = newValue.address;
            selectedCoordinates.value = newValue.coordinates;
        }
    },
    { deep: true }
);
</script>
