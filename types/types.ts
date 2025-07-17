import type { DateValue } from '@internationalized/date';

export interface FormData {
    date: DateValue | null;
    time: string | null;
    passengersUnder12: number;
    passengersOver12: number;
    from: string;
    to: string;
    name: string;
    phone: string;
}
