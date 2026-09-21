import { ExecuteNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';
import { add, differenceInMilliseconds } from 'date-fns';

export class DelayNode extends ExecuteNode {
    readonly typeId = 'time-delay';
    readonly displayName = 'Delay';
    readonly category = { name: 'Time', accent: 'sky-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Duration', acceptsType: 'time:duration' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Time', outputType: 'time:datetime' }
    ];

    readonly properties: PropertyDefinition[] = [];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const duration = inputs['Duration'];
        
        if (!duration) {
            return { 'Time': new Date().toISOString() };
        }

        const now = new Date();
        const targetTime = add(now, duration);
        const msToWait = differenceInMilliseconds(targetTime, now);

        if (msToWait > 0) {
            await new Promise(resolve => setTimeout(resolve, msToWait));
        }

        return { 'Time': new Date().toISOString() };
    }
}
