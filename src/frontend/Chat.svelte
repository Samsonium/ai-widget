<script lang="ts">
    import {onMount} from 'svelte'
    import Message from './chat/Message.svelte';
    import Chip from './chat/Chip.svelte';

    let selectedId = 0
    let chats: {
        name: string,
        messages: {
            role: 'assistant' | 'user' | 'system',
            content: string
        }[]
    }[] = []

    const headers = {
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    }

    const dataSetup = {
        model: 'gpt-3.5-turbo-0613',
        temperature: .5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true
    }

    async function getNameForChat() {
        const data = {
            messages: [...chats[selectedId].messages, {
                role: 'user',
                content: 'Опиши одним-двумя словами тему диалога'
            }],
            ...dataSetup,
            stream: false
        }
        try {
            const result = await fetch('https://gpt4.xunika.uk/api/openai/v1/chat/completions', {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            })
            const json = await result.json()
            chats[selectedId].name = json.choices[0].message.content.trim()
        } catch (_) {
            chats[selectedId].name = 'Мутный чат'
        }

        chats = chats
        localStorage.setItem('messages', JSON.stringify(chats))
    }

    let value = ''
    let typingValue = ''

    async function sendMsg() {
        if (!value?.trim())
            return;

        const chatBox = document.querySelector<HTMLDivElement>('.messages');
        typingValue = ' '

        chats[selectedId].messages.push({
            role: 'user',
            content: value
        })
        chats = chats

        console.log('Before slice:', chats[selectedId].messages.length)
        const snapshot = Object.assign([], chats[selectedId].messages);

        const data = {
            messages: snapshot.reverse().slice(0, 5).reverse(),
            ...dataSetup
        }

        console.log('After slice:', chats[selectedId].messages.length)

        value = ''

        try {
            const result = await fetch('https://gpt4.xunika.uk/api/openai/v1/chat/completions', {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            })

            const stream = result.body;
            const decoder = new TextDecoder();
            const reader = stream?.getReader();

            function handleData(text: Uint8Array) {
                const decoded = decoder.decode(text);
                const parts = decoded.split('\n').filter(Boolean)
                    .map(message => message.substring(message.indexOf('{')))
                for (const part of parts) {
                    try {
                        const parsed = JSON.parse(part);
                        const msgChunk = parsed?.choices?.[0]?.delta?.content;

                        if (msgChunk)
                            typingValue = (typingValue + msgChunk) ?? 'Печатает...'
                    } catch (_) {
                        continue;
                    } finally {
                        chatBox?.scrollTo({
                            top: chatBox?.scrollHeight
                        })
                    }
                }
            }

            async function readStream() {
                if (!reader) throw ''

                while (true) {
                    const {done, value} = await reader.read();

                    if (done) break;

                    // Обработайте полученные данные
                    handleData(value);
                    await new Promise(r => setTimeout(r, 10))
                }
            }

            await readStream()

            console.log('After request:', chats[selectedId].messages.length)

            chats[selectedId].messages.push({
                role: 'assistant',
                content: typingValue
            })

            if (chats[selectedId].messages.length < 3)
                getNameForChat().catch(err =>
                    console.error('Cannot get name for chat', err))
        } catch (e) {
            console.error(e)
            chats[selectedId].messages.push({
                role: 'assistant',
                content: 'Ошибка при выполнении запроса'
            })
        }

        typingValue = ''
        chats = chats
        localStorage.setItem('messages', JSON.stringify(chats))
    }

    function createChat() {
        chats = [{
            name: 'Новый чат',
            messages: []
        }, ...chats]
        selectedId = 0
    }

    function deleteChat(id: number) {
        chats.splice(id, 1);
        localStorage.setItem('messages', JSON.stringify(chats))

        if (!chats.length)
            createChat()

        chats = chats
    }

    function editChat(i: number, e: CustomEvent) {
        chats[i].name = e.detail
        chats = chats
        localStorage.setItem('messages', JSON.stringify(chats))
    }

    onMount(() => {
        const messages = localStorage.getItem('messages')
        if (messages) chats = JSON.parse(messages)
        if (!chats?.length) createChat()

        localStorage.setItem('messages', JSON.stringify(chats))
    })
</script>

<div class="chat-box">
    <div class="chat-list">
        <button class="create-chat" title="Новый чат" on:click={createChat}>
            &plus;
        </button>

        {#each chats as chat, i}
            <Chip selected={selectedId === i}
                  count={chat.messages.length}
                  name={chat.name}
                  on:click={() => selectedId = i}
                  on:delete={() => deleteChat(i)}
                  on:save-name={(e) => editChat(i, e)}
            />
        {/each}
    </div>
    <div class="messages">
        <div class="contents">
            {#each chats[selectedId]?.messages ?? [] as msg}
                <Message {...msg}/>
            {/each}

            {#if typingValue}
                <Message role="assistant" content={typingValue || 'Печатает...'}/>
            {/if}
        </div>
    </div>
    <form class="input-box" on:submit|preventDefault={sendMsg}>
        <input type="text" placeholder="Начните печатать..." bind:value>
        <button class="send" type="submit">
            &nearr;
        </button>
    </form>
</div>

<style>
    .chat-box {
        min-height: 100%;
        display: grid;
        grid-template-rows: 48px 88% 48px;
    }

    .chat-list {
        position: relative;
        height: 48px;
        border-bottom: 1px solid rgba(255, 255, 255, .15);
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: flex-start;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0 48px 0 8px;
    }

    .chat-list::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
        opacity: 0;
    }

    .chat-list button.create-chat {
        position: fixed;
        z-index: 200;
        right: 0;
        width: 32px;
        height: 32px;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #333333;
        font: 500 18px Inter, sans-serif;
        color: white;
        border-color: rgba(255, 255, 255, .15);
        border-width: 1px 0 1px 1px;
        border-radius: 16px 0 0 16px;
        cursor: pointer;
        transition: all .2s cubic-bezier(.25, 0, 0, 1);
    }

    .chat-list button.create-chat:hover {
        filter: brightness(90%);
    }

    .messages {
        display: block;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .messages .contents {
        display: flex;
        flex-flow: column;
        align-items: stretch;
        justify-content: flex-end;
        padding: 16px;
    }

    .messages::-webkit-scrollbar {
        width: 8px;
    }

    .messages::-webkit-scrollbar-track {
        background: #666666;
    }

    .messages::-webkit-scrollbar-thumb {
        background: #22292a;
    }

    .input-box {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, .15);
    }

    input {
        height: 80%;
        flex: 1 1;
        background: transparent;
        border: none;
        padding: 0 16px;
        margin: 0;
        outline: 0;
        color: white;
        font: 400 16px Inter, sans-serif;
    }

    button.send {
        width: 32px;
        height: 32px;
        border: 1px solid rgba(255, 255, 255, .25);
        background: #3f5175;
        margin: 0 8px;
        padding: 0;
        border-radius: 8px;
        color: white;
        font: 700 24px Inter, monospace;
    }
</style>
