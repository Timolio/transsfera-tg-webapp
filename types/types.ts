import type { DateValue } from '@internationalized/date';

export interface FormData {
    date: DateValue | null;
    time: string | null;
    passengers: number;
    from: string;
    to: string;
}
