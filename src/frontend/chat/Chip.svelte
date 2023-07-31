<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import Chat from 'phosphor-svelte/lib/Chat'
    import X from 'phosphor-svelte/lib/X'

    export let count = 0
    export let name = 'Чат'
    export let selected = false;

    const dispatch = createEventDispatcher()

    function deleteChat() {
        dispatch('delete')
    }

    let isEditing = false
    let newName = name

    function stopEditing() {
        name = newName;
        isEditing = false;
        dispatch('save-name', name);
    }
</script>

<button class="chat-chip"
        class:selected
        on:dblclick|stopPropagation={() => isEditing = true}
        on:click>
    <span class="message-count">
        <Chat size={14} weight="bold" />
        {count}
    </span>
    {#if isEditing}
        <input type="text"
               on:blur={stopEditing}
               bind:value={newName}>
    {:else}
        {name}
        <span class="close" on:click|stopPropagation={deleteChat}>
            <X size={10} weight="bold" />
        </span>
    {/if}
</button>

<style>
    input {
        height: 90%;
        background: #262e2f;
        color: white;
        border: none;
        padding: 2px 8px;
        border-radius: 12px;
    }

    button.chat-chip {
        min-width: max-content;
        max-width: 200px;
        height: 32px;
        margin: 0;
        padding: 0 8px 0 4px;
        font: 300 16px Inter, sans-serif;
        background: #2a2e2f;
        color: white;
        border: 1px solid #414141;
        border-radius: 16px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: pointer;
    }

    button.chat-chip:not(:last-child) {
        margin-right: 8px;
    }

    button.chat-chip.selected {
        filter: brightness(120%);
        border-color: #3f5175;
    }

    span.message-count {
        padding: 2px 8px ;
        background: #262626;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, .15);
    }

    span.close {
        margin-left: 8px;
    }
</style>
