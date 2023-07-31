import {get, writable, type Writable} from 'svelte/store';
import type ChatDefinition from '../types/ChatDefinition';
import type RequestBodyDefinition from '../types/RequestBodyDefinition';
import type MessageDefinition from '../types/MessageDefinition';
import type MetaDefinition from '../types/MetaDefinition';

export default class Chat {

    /** Request URL */
    private static readonly url = 'https://gpt4.xunika.uk/api/openai/v1/chat/completions';

    /** Request headers */
    private static readonly headers = {
        'Authority': 'gpt4.xunika.uk',
        'Accept': 'text/event-stream',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Authorization': 'Bearer ak-chatgptorguk',
        'Content-Type': 'application/json',
        'Origin': 'https://gpt4.xunika.uk',
        'Referer': 'https://gpt4.xunika.uk/',
        'Sec-Ch-Ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' +
            ' (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    } as const;

    /** Request body model setup */
    private static readonly setup = {
        model: 'gpt-3.5-turbo-0613',
        temperature: .5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    } as const;

    /** Selected chat index */
    public readonly selected: Writable<number>;

    /** Chats history */
    public readonly chats: Writable<ChatDefinition[]>;

    /** Typing message from AI */
    public readonly aiMessage: Writable<string>;

    public constructor() {
        try {
            this.chats = writable(JSON.parse(localStorage.getItem('ai-history')!));
        } catch (_) {
            this.chats = writable([]);
        }

        const selected = Number.parseInt(localStorage.getItem('ai-sel')!);
        this.selected = writable(Number.isNaN(selected) ? 0 : selected);
        this.aiMessage = writable('');

        //-----------------------

        this.chats.subscribe((chats) => {
            if (!chats) this.chats.set([]);
            if (!chats.length) this.createChat();
            localStorage.setItem('ai-history', JSON.stringify(chats));
        })

        this.selected.subscribe((selected) => {
            localStorage.setItem('ai-sel', selected.toString());
        });
    }

    /**
     * Creates new chat
     */
    public createChat(): void {
        let formatter = new Intl.DateTimeFormat('ru-RU');
        this.chats.update((chats) => ([{
            name: 'Новый чат',
            messages: [{
                role: 'system',
                content: 'Диалог начат ' + formatter.format(Date.now())
            }],
            metadata: []
        }, ...chats]));
        this.selected.set(0);
    }

    /**
     * Set new name for a chat
     * @param name New name
     */
    public renameChat(name: string): void {
        this.chats.update((chats) => {

            // Look for same name chat
            const snChat = chats.find((chat) =>
                (chat.name.toLowerCase() === name.toLowerCase()));

            if (snChat) return chats;
            chats[get(this.selected)].name = name;

            return chats;
        });
    }

    /**
     * Removes chat
     * @param i Index
     */
    public deleteChat(i: number): void {
        this.chats.update((chats) => {
            if (chats[i]) chats.splice(i, 1);
            return chats;
        })
    }

    /**
     * Make request to AI
     * @param body POST body data
     */
    async makeRequest(body: RequestBodyDefinition): Promise<string | null> {
        body.messages = body.messages.filter(
            (message) => (message.role !== 'system'));

        try {
            const res = await fetch(Chat.url, {
                method: 'POST',
                headers: Chat.headers,
                body: JSON.stringify(body)
            });

            // Check stream key (base JSON or character stream)
            if (!body.stream) {
                const json = await res.json();
                return json.choices[0].message.content.trim();
            } else {
                const stream = res.body;
                const dec = new TextDecoder();
                const reader = stream!.getReader();

                // Iterate until stream finished
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    // Parse message
                    const decoded = dec.decode(value);
                    const parts = decoded.split('\n').filter(Boolean)
                        .map(msg => msg.substring(msg.indexOf('{')));

                    // Iterate over message parts
                    for (const pt of parts) {
                        try {
                            const parsed = JSON.parse(pt);
                            const msgChunk = parsed.choices[0].delta.content;

                            // Concat chunk with message
                            if (msgChunk) this.aiMessage
                                .update((text) => (text + msgChunk));
                        } catch (_) {}
                    }

                    // Wait for 50ms to make text more human-readable on fly
                    await new Promise(r => setTimeout(r, 50));
                }
            }
        } catch (_) {
            return null;
        }

        return get(this.aiMessage);
    }

    /**
     * Request name of current chat
     */
    public async getNameForChat(): Promise<void> {
        let name = await this.makeRequest({
            ...Chat.setup,
            stream: false,
            messages: [...get(this.chats)[get(this.selected)].messages, {
                role: 'user',
                content: 'Придумай короткое название для этого диалога и напиши его без кавычек'
            }]
        });

        if (!name) return;
        this.chats.update(chats => {
            chats[get(this.selected)].name = name as string;
            return chats;
        })
    }

    /**
     * Ask AI with message
     * @param message User-defined message
     */
    public async askAI(message: string): Promise<void> {
        let chatSnapshot: MessageDefinition[] = [];
        let chatMeta: MetaDefinition[] = [];

        // Push user message and get chat snapshot and meta
        this.chats.update((chats) => {
            chats[get(this.selected)].messages.push({
                role: 'user',
                content: message
            });

            chatSnapshot = chats[get(this.selected)].messages
                .filter((msg) => (msg.role !== 'system')).slice(0, 4);
            chatMeta = chats[get(this.selected)].metadata
                .filter((meta) => (meta.enabled));

            return chats;
        });

        // Send request and retrieve message
        const content = await this.makeRequest({
            ...Chat.setup,
            stream: true,
            messages: [
                ...chatMeta.map(meta => ({
                    role: 'system',
                    content: meta.context
                })),
                ...chatSnapshot
            ] as MessageDefinition[]
        });

        // Push assistant message and clear aiMessage store
        this.chats.update((chats) => {
            chats[get(this.selected)].messages.push({
                role: 'assistant',
                content: content ?? 'Ошибка генерации :('
            });

            this.aiMessage.update(() => (''));

            return chats;
        });
    }
}
