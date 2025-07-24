import type { DateValue } from '@internationalized/date';

// export interface LocationData {
//     address: string;
//     coordinates: [number, number];
// }

export interface OrderData {
    date: DateValue | null;
    time: string | null;
    children: number;
    adults: number;
    from_location: string | null;
    to_location: string | null;
    name: string;
    phone: string;
}
