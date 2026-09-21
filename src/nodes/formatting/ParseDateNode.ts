import { BaseNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';
import { parse } from 'date-fns';

export class ParseDateNode extends BaseNode {
    readonly typeId = 'time-parse';
    readonly displayName = 'Parse Date';
    readonly category = { name: 'Time', accent: 'emerald-400' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Date String', acceptsType: 'core:string' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Time', outputType: 'time:datetime' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'format', label: 'Format String', type: 'string' as const, defaultValue: 'yyyy-MM-dd' }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const dateStr = inputs['Date String'];
        const formatStr = properties['format'] || 'yyyy-MM-dd';

        if (!dateStr) return {};

        try {
            const date = parse(dateStr, formatStr, new Date());
            return { 'Time': date.toISOString() };
        } catch (err) {
            console.error('Failed to parse date', err);
            return {};
        }
    }
}
