import type { DateValue } from '@internationalized/date';

export interface LocationData {
    address: string;
    coordinates: [number, number];
}

export interface FormData {
    date: DateValue | null;
    time: string | null;
    passengersUnder12: number;
    passengersOver12: number;
    from: LocationData | null;
    to: LocationData | null;
    name: string;
    phone: string;
}
