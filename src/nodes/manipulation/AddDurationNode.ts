import { BaseNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';
import { add, parseISO } from 'date-fns';

export class AddDurationNode extends BaseNode {
    readonly typeId = 'time-add-duration';
    readonly displayName = 'Add Duration';
    readonly category = { name: 'Time', accent: 'indigo-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Time', acceptsType: 'time:datetime' },
        { name: 'Duration', acceptsType: 'time:duration' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Time', outputType: 'time:datetime' }
    ];

    readonly properties: PropertyDefinition[] = [];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const timeStr = inputs['Time'];
        const duration = inputs['Duration'];

        if (!timeStr || !duration) return {};

        try {
            const date = typeof timeStr === 'string' ? parseISO(timeStr) : new Date(timeStr);
            const newDate = add(date, duration);
            return { 'Time': newDate.toISOString() };
        } catch (err) {
            console.error('Failed to add duration', err);
            return {};
        }
    }
}
