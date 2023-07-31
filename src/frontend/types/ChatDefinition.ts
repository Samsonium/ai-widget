import type MessageDefinition from './MessageDefinition';
import type MetaDefinition from './MetaDefinition';

/**
 * Chat data
 */
export default interface ChatDefinition {
    name: string;
    messages: MessageDefinition[];
    metadata: MetaDefinition[];
}
