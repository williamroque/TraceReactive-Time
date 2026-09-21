import { EventNode } from '@tracereactive/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@tracereactive/types';
import { addDays, differenceInMilliseconds, getDay, set } from 'date-fns';

export class ScheduleNode extends EventNode {
    readonly typeId = 'time-schedule';
    readonly displayName = 'Schedule';
    readonly category = { name: 'Time', accent: 'amber-400' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [];

    readonly outputs: OutputDefinition[] = [
        { name: 'Time', outputType: 'time:datetime' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'timeOfDay', label: 'Time (HH:mm)', type: 'string' as const, defaultValue: '09:00' },
        { name: 'daysOfWeek', label: 'Days', type: 'string' as const, defaultValue: 'Everyday' },
        { name: 'enabled', label: 'Enabled', type: 'boolean' as const, defaultValue: true }
    ];

    private timeoutIds: Map<string, ReturnType<typeof setTimeout>> = new Map();
    static latestEvents: Map<string, { time: string }> = new Map();

    register(nodeId: string, emit: (nodeId: string) => void): void {
        ScheduleNode.emitters.set(nodeId, emit);
    }

    unregister(nodeId: string): void {
        const timeoutId = this.timeoutIds.get(nodeId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeoutIds.delete(nodeId);
        }
        ScheduleNode.latestEvents.delete(nodeId);
        ScheduleNode.emitters.delete(nodeId);
    }

    private computeNextTriggerTime(now: Date, timeOfDay: string, daysOfWeek: string): Date {
        const [hoursStr, minutesStr] = timeOfDay.split(':');
        const hours = parseInt(hoursStr, 10) || 0;
        const minutes = parseInt(minutesStr, 10) || 0;

        let target = set(now, { hours, minutes, seconds: 0, milliseconds: 0 });

        if (target.getTime() <= now.getTime()) {
            target = addDays(target, 1);
        }

        const validDays = this.parseDaysOfWeek(daysOfWeek);
        if (validDays.length > 0 && validDays.length < 7) {
            while (!validDays.includes(getDay(target))) {
                target = addDays(target, 1);
            }
        }

        return target;
    }

    private parseDaysOfWeek(daysStr: string): number[] {
        const str = daysStr.toLowerCase();
        if (str.includes('everyday')) return [0, 1, 2, 3, 4, 5, 6];
        if (str.includes('weekday')) return [1, 2, 3, 4, 5];
        if (str.includes('weekend')) return [0, 6];
        
        const daysMap: Record<string, number> = {
            'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
        };
        const res: number[] = [];
        for (const [key, val] of Object.entries(daysMap)) {
            if (str.includes(key)) res.push(val);
        }
        return res.length > 0 ? res : [0, 1, 2, 3, 4, 5, 6]; // Default everyday if parsing fails
    }

    private scheduleNext(nodeId: string, timeOfDay: string, daysOfWeek: string) {
        const now = new Date();
        const nextTime = this.computeNextTriggerTime(now, timeOfDay, daysOfWeek);
        const msToWait = differenceInMilliseconds(nextTime, now);

        const timeoutId = setTimeout(() => {
            const emit = ScheduleNode.emitters.get(nodeId);
            if (emit) {
                const time = new Date().toISOString();
                ScheduleNode.latestEvents.set(nodeId, { time });
                emit(nodeId);
            }
            // Reschedule
            this.scheduleNext(nodeId, timeOfDay, daysOfWeek);
        }, msToWait);

        this.timeoutIds.set(nodeId, timeoutId);
    }

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const nodeId = properties['_nodeId'];
        const timeOfDay = properties['timeOfDay'] || '09:00';
        const daysOfWeek = properties['daysOfWeek'] || 'Everyday';
        const enabled = properties['enabled'] !== false;

        if (!nodeId) return {};

        const existingTimeout = this.timeoutIds.get(nodeId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.timeoutIds.delete(nodeId);
        }

        if (enabled) {
            this.scheduleNext(nodeId, timeOfDay, daysOfWeek);
        }

        const latestEvent = ScheduleNode.latestEvents.get(nodeId);
        return {
            'Time': latestEvent ? latestEvent.time : new Date().toISOString()
        };
    }

    static emitters: Map<string, (nodeId: string) => void> = new Map();
}
