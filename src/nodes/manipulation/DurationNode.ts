import { BaseNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';

export class DurationNode extends BaseNode {
    readonly typeId = 'time-duration';
    readonly displayName = 'Duration';
    readonly category = { name: 'Time', accent: 'indigo-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [];

    readonly outputs: OutputDefinition[] = [
        { name: 'Duration', outputType: 'time:duration' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'years', label: 'Years', type: 'number' as const, defaultValue: 0 },
        { name: 'months', label: 'Months', type: 'number' as const, defaultValue: 0 },
        { name: 'weeks', label: 'Weeks', type: 'number' as const, defaultValue: 0 },
        { name: 'days', label: 'Days', type: 'number' as const, defaultValue: 0 },
        { name: 'hours', label: 'Hours', type: 'number' as const, defaultValue: 0 },
        { name: 'minutes', label: 'Minutes', type: 'number' as const, defaultValue: 0 },
        { name: 'seconds', label: 'Seconds', type: 'number' as const, defaultValue: 0 }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const duration = {
            years: properties['years'] || 0,
            months: properties['months'] || 0,
            weeks: properties['weeks'] || 0,
            days: properties['days'] || 0,
            hours: properties['hours'] || 0,
            minutes: properties['minutes'] || 0,
            seconds: properties['seconds'] || 0
        };

        return { 'Duration': duration };
    }
}
