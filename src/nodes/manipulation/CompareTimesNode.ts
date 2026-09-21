import { BaseNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';
import { intervalToDuration, isAfter, parseISO } from 'date-fns';

export class CompareTimesNode extends BaseNode {
    readonly typeId = 'time-compare';
    readonly displayName = 'Compare Times';
    readonly category = { name: 'Time', accent: 'indigo-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Time A', acceptsType: 'time:datetime' },
        { name: 'Time B', acceptsType: 'time:datetime' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Duration', outputType: 'time:duration' },
        { name: 'A > B', outputType: 'core:boolean' }
    ];

    readonly properties: PropertyDefinition[] = [];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const timeAStr = inputs['Time A'];
        const timeBStr = inputs['Time B'];

        if (!timeAStr || !timeBStr) return {};

        try {
            const dateA = typeof timeAStr === 'string' ? parseISO(timeAStr) : new Date(timeAStr);
            const dateB = typeof timeBStr === 'string' ? parseISO(timeBStr) : new Date(timeBStr);

            const duration = intervalToDuration({
                start: dateA.getTime() < dateB.getTime() ? dateA : dateB,
                end: dateA.getTime() < dateB.getTime() ? dateB : dateA
            });

            return {
                'Duration': duration,
                'A > B': isAfter(dateA, dateB)
            };
        } catch (err) {
            console.error('Failed to compare times', err);
            return {};
        }
    }
}
