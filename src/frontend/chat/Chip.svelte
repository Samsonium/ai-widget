<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import Chat from 'phosphor-svelte/lib/Chat'
    import X from 'phosphor-svelte/lib/X'

    /** Messages count */
    export let count = 0

    /** Chat name */
    export let name = 'Чат'

    /** Is chat selected */
    export let selected = false;

    /** Event dispatcher */
    const dispatch = createEventDispatcher()

    /** Renaming state */
    let isEditing = false

    /** New name value */
    let newName = name

    /**
     * Chat deletion event handler
     */
    function onChatDelete() {
        dispatch('delete')
    }

    /**
     * Chat rename finish event handler
     */
    function onFinishEdit() {
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
               on:blur={onFinishEdit}
               bind:value={newName}>
    {:else}
        {name}
        <span class="close" on:click|stopPropagation={onChatDelete}>
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
        background: var(--panel);
        color: rgba(255, 255, 255, .5);
        border: 1px solid var(--border);
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
        background: var(--g-active);
        border-color: var(--primary);
        color: white;
    }

    span.message-count {
        padding: 2px 8px;
        background: var(--surface);
        border-radius: 16px;
        border: 1px solid var(--border);
    }

    span.close {
        margin-left: 8px;
    }
</style>
