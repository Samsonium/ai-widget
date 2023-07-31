<script lang="ts">
    import UserCircle from 'phosphor-svelte/lib/UserCircle'
    import CircleDashed from 'phosphor-svelte/lib/CircleDashed'

    export let role = 'user'
    export let content = 'Some message'

    function prepareMessage(msg: string) {
        return msg.split('\n').filter(Boolean).join('\n')
            .replaceAll(/</g, '&lt;')
            .replaceAll(/>/g, '&gt;')
            .replaceAll(/```([a-zA-Z]+)?\n([\s\S]+?)\n```/g, (_, lang, code) => {
                let result = ''
                if (lang) result += `<span class="code-lang">${lang}</span>`
                const fll = code.split('\n')[0].match(/^( )*/)?.[0]?.length ?? 0
                const preparedCode = code.split('\n').map((line: string) => line.substring(fll)).join('\n')

                return result + `<pre>${preparedCode}</pre>`
            })
            .replaceAll(/\n(\d+?)\. ([\s\S]+?)/g, (_, num, line) => `<br/><b style="margin-left: 12px">${num}.</b> ${line}`)
            .replaceAll(/`([\s\S]+?)`/g, (_, block) => `<code>${block}</code>`)
            .replaceAll(/\*\*(.*)\*\*/g, (_, text) => `<b>${text}</b>`)
            .replaceAll(/\*([^*]*)\*/g, (_, text) => `<i>${text}</i>`)
            .replaceAll('\n', '<br/><span style="margin-left: 8px"></span>')
    }
</script>

<div class="message {role}">
    {#if role === 'user'}
        <UserCircle weight="bold" size={32} color="white" />
    {:else if role === 'assistant'}
        <CircleDashed weight="bold" size={32} color="white" />
    {/if}
    <span class="content">{@html prepareMessage(content)}</span>
</div>

<style>
    img.avatar {
        width: 24px;
        height: 24px;
    }

    .message {
        min-height: max-content;
        margin-bottom: 24px;
    }

    .message.user, .message.assistant {
        display: flex;
        flex-flow: column;
        color: white;
    }

    .message.user {
        align-items: flex-end;
    }

    .message.user .content, .message.assistant .content {
        padding: 8px 12px;
        margin-top: 4px;
        background: #2a2a2a;
        border: 1px solid black;
        border-radius: 16px;
        line-height: calc(15px * 1.6);
    }

    :global(span.code-lang) {
        position: relative;
        z-index: 15;
        width: max-content;
        display: block;
        padding: 2px 8px;
        background: #22292a;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border: 1px solid rgba(255, 255, 255, .25);
        border-width: 1px 1px 0 1px;
        margin: 16px 0 -1px 8px;
    }

    :global(pre) {
        height: max-content;
        background: #22292a;
        padding: 8px;
        overflow-x: auto;
        border: 1px solid rgba(255, 255, 255, .25);
        border-radius: 8px;
        margin: 0;
        user-select: all;
    }

    :global(code) {
        padding: 2px 4px;
        border-radius: 4px;
        background: #22292a;
        border: 1px solid rgba(255, 255, 255, .25);
    }
</style>
