<script lang="ts">
    import Chat from './utils/Chat';
    import Message from './chat/Message.svelte';
    import Chip from './chat/Chip.svelte';

    let chat = new Chat();

    // Destruct class to get stores
    const {
        aiMessage,
        selected,
        chats
    } = chat;

    // Input message value
    let value: string = '';

    // Chat container
    let container: HTMLDivElement;

    // Subscribe for aiMessage to scroll page to bottom when AI types message
    aiMessage.subscribe(() => {
        container?.scrollTo({
            top: container?.scrollHeight
        })
    });

    /** Submit message form event handler */
    function onSubmitMessage(): void {
        if (!value.trim()) return;
        chat.askAI(value).then(async () => {
            if ($chats[$selected].messages.length < 4)
                await chat.getNameForChat();
        });
        value = ''
    }

    /** Chat creation event handler */
    function onCreateChat(): void {
        chat.createChat();
    }
</script>

<div class="chat-box">
    <div class="chat-list">
        <button class="create-chat" title="Новый чат" on:click={onCreateChat}>
            &plus;
        </button>

        {#each $chats as c, i}
            <Chip selected={$selected === i}
                  count={(c.messages.length - 1) ?? 0}
                  name={c.name}
                  on:click={() => ($selected = i)}
                  on:delete={() => chat.deleteChat(i)}
                  on:save-name={(e) => chat.renameChat(e.detail)}
            />
        {/each}
    </div>
    <div class="messages" bind:this={container}>
        <div class="contents">
            {#each $chats[$selected]?.messages ?? [] as msg}
                <Message {...msg}/>
            {/each}

            {#if $aiMessage}
                <Message role="assistant" content={$aiMessage?.trim() ?? 'Печатает...'}/>
            {/if}
        </div>
    </div>
    <form class="input-box" on:submit|preventDefault={onSubmitMessage}>
        <input type="text" placeholder="Начните печатать..." bind:value>
        <button class="send" type="submit">
            &nearr;
        </button>
    </form>
</div>

<style>
    .chat-box {
        height: 100vh;
        display: grid;
        grid-template-rows: 48px 1fr 48px;
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
        max-height: calc(100vh - 160px);
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
