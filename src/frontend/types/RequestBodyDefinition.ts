import type MessageDefinition from './MessageDefinition';

/**
 * POST body request data
 */
export default interface RequestBodyDefinition {
    model: 'gpt-3.5-turbo-0613',
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    stream: boolean;
    messages: MessageDefinition[];
}
