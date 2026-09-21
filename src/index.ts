import { CurrentTimeNode } from './nodes/execute/CurrentTimeNode';
import { DelayNode } from './nodes/execute/DelayNode';
import { IntervalNode } from './nodes/event/IntervalNode';
import { ScheduleNode } from './nodes/event/ScheduleNode';
import { DurationNode } from './nodes/manipulation/DurationNode';
import { AddDurationNode } from './nodes/manipulation/AddDurationNode';
import { SubtractDurationNode } from './nodes/manipulation/SubtractDurationNode';
import { CompareTimesNode } from './nodes/manipulation/CompareTimesNode';
import { ParseDateNode } from './nodes/formatting/ParseDateNode';
import { FormatDateNode } from './nodes/formatting/FormatDateNode';
import { ExtractDatePartsNode } from './nodes/formatting/ExtractDatePartsNode';

declare const traceReactive: any;

const nodes = [
    new CurrentTimeNode(),
    new DelayNode(),
    new IntervalNode(),
    new ScheduleNode(),
    new DurationNode(),
    new AddDurationNode(),
    new SubtractDurationNode(),
    new CompareTimesNode(),
    new ParseDateNode(),
    new FormatDateNode(),
    new ExtractDatePartsNode()
];

const serializableNodes = nodes.map(n => ({
    typeId: n.typeId,
    displayName: n.displayName,
    category: n.category,
    nodeInterface: n.nodeInterface,
    visible: n.visible,
    inputs: n.inputs,
    outputs: n.outputs,
    properties: n.properties,
    dynamicInputs: n.dynamicInputs,
    dynamicOutputs: n.dynamicOutputs
}));

traceReactive.registerNodes(serializableNodes);

traceReactive.onEvaluateNode(async ({ typeId, inputs, properties }: any) => {
    const node = nodes.find(n => n.typeId === typeId);
    if (!node) {
        throw new Error(`Unknown node type: ${typeId}`);
    }
    return await node.evaluate(inputs, properties);
});
