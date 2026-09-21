import { BaseNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';
import { getYear, getMonth, getDate, getHours, getMinutes, getSeconds, parseISO } from 'date-fns';

export class ExtractDatePartsNode extends BaseNode {
    readonly typeId = 'time-extract-parts';
    readonly displayName = 'Extract Parts';
    readonly category = { name: 'Time', accent: 'emerald-400' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Time', acceptsType: 'time:datetime' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Year', outputType: 'core:number' },
        { name: 'Month', outputType: 'core:number' },
        { name: 'Day', outputType: 'core:number' },
        { name: 'Hour', outputType: 'core:number' },
        { name: 'Minute', outputType: 'core:number' },
        { name: 'Second', outputType: 'core:number' }
    ];

    readonly properties: PropertyDefinition[] = [];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const timeStr = inputs['Time'];

        if (!timeStr) return {};

        try {
            const date = typeof timeStr === 'string' ? parseISO(timeStr) : new Date(timeStr);
            return {
                'Year': getYear(date),
                'Month': getMonth(date) + 1, // getMonth is 0-indexed in JS, but 1-12 is more intuitive for users
                'Day': getDate(date),
                'Hour': getHours(date),
                'Minute': getMinutes(date),
                'Second': getSeconds(date)
            };
        } catch (err) {
            console.error('Failed to extract date parts', err);
            return {};
        }
    }
}
