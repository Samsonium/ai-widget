/**
 * Message data
 */
export default interface MessageDefinition {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
