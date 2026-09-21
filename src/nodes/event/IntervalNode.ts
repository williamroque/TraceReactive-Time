import { EventNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';

export class IntervalNode extends EventNode {
    readonly typeId = 'time-interval';
    readonly displayName = 'Interval';
    readonly category = { name: 'Time', accent: 'amber-400' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [];

    readonly outputs: OutputDefinition[] = [
        { name: 'Time', outputType: 'time:datetime' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'intervalMs', label: 'Interval (ms)', type: 'number' as const, defaultValue: 1000 },
        { name: 'enabled', label: 'Enabled', type: 'boolean' as const, defaultValue: true }
    ];

    private intervalIds: Map<string, ReturnType<typeof setInterval>> = new Map();
    static latestEvents: Map<string, { time: string }> = new Map();

    register(nodeId: string, emit: (nodeId: string) => void): void {
        // We cannot reliably access properties directly in `register` without evaluating, 
        // but typically the app ensures the first evaluate gets called to set things up,
        // or we could just wait for `evaluate` to set the interval.
        // Actually, TraceReactive calls `evaluate` whenever the graph is loaded or properties change.
        // We will start the interval inside `evaluate` instead, using `register` just to store the emitter.
        IntervalNode.emitters.set(nodeId, emit);
    }

    unregister(nodeId: string): void {
        const intervalId = this.intervalIds.get(nodeId);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervalIds.delete(nodeId);
        }
        IntervalNode.latestEvents.delete(nodeId);
        IntervalNode.emitters.delete(nodeId);
    }

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const nodeId = properties['_nodeId'];
        const intervalMs = typeof properties['intervalMs'] === 'number' ? properties['intervalMs'] : 1000;
        const enabled = properties['enabled'] !== false;

        if (!nodeId) return {};

        // Clean up previous interval if it exists and settings changed
        const existingInterval = this.intervalIds.get(nodeId);
        if (existingInterval) {
            clearInterval(existingInterval);
            this.intervalIds.delete(nodeId);
        }

        if (enabled) {
            const intervalId = setInterval(() => {
                const emit = IntervalNode.emitters.get(nodeId);
                if (emit) {
                    const time = new Date().toISOString();
                    IntervalNode.latestEvents.set(nodeId, { time });
                    emit(nodeId);
                }
            }, intervalMs);
            this.intervalIds.set(nodeId, intervalId);
        }

        const latestEvent = IntervalNode.latestEvents.get(nodeId);
        return {
            'Time': latestEvent ? latestEvent.time : new Date().toISOString()
        };
    }

    static emitters: Map<string, (nodeId: string) => void> = new Map();
}
