import { BaseNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';
import { format, parseISO } from 'date-fns';

export class FormatDateNode extends BaseNode {
    readonly typeId = 'time-format';
    readonly displayName = 'Format Date';
    readonly category = { name: 'Time', accent: 'emerald-400' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Time', acceptsType: 'time:datetime' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Formatted', outputType: 'core:string' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'format', label: 'Format String', description: 'Syntax based on date-fns format (e.g. PPP p, yyyy-MM-dd).', type: 'string' as const, defaultValue: 'PPP p' }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const timeStr = inputs['Time'];
        const formatStr = properties['format'] || 'PPP p';

        if (!timeStr) return {};

        try {
            const date = typeof timeStr === 'string' ? parseISO(timeStr) : new Date(timeStr);
            const formatted = format(date, formatStr);
            return { 'Formatted': formatted };
        } catch (err) {
            console.error('Failed to format date', err);
            return {};
        }
    }
}
