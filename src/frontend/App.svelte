<script lang="ts">
  import Chat from './Chat.svelte';

  let expanded = true
  $: window.core?.focus(expanded)

  function handleMouseOver(type: boolean) {
    if (expanded) return;
    window.core?.focus(type)
  }
</script>

<div class="holder">
  <div class="box" class:collapsed={!expanded}>
    <button class="expander"
            on:click={() => expanded = !expanded}
            on:mouseover={handleMouseOver.bind(null, true)}
            on:mouseout={handleMouseOver.bind(null, false)}>
      {#if expanded}
        &searr;
      {:else}
        &nwarr;
      {/if}
    </button>

    <div class="ai-icon">
      AI
    </div>

    <div class="content">
      <div class="header">
        <h3>AI ассистент</h3>
      </div>
      <Chat />
    </div>
  </div>
</div>

<style>
  .holder {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-end;
    justify-content: flex-end;
    background: transparent;
    pointer-events: none;
    user-select: none;
  }

  .box {
    position: relative;
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    background: #2d2d2d;
    pointer-events: visiblePainted;
    display: flex;
    flex-flow: row;
    align-items: center;
    margin-bottom: 1px;
    justify-content: center;
    border-top-left-radius: 16px;
    border-bottom-left-radius: 16px;
    outline: 1px solid #414141;
    transition: width .5s cubic-bezier(.25, 0, 0, 1),
                height .5s cubic-bezier(.25, 0, 0, 1),
                background .5s cubic-bezier(.25, 0, 0, 1);
  }

  .box.collapsed {
    width: 50px;
    height: 50px;
    background: #efefef;
  }

  button.expander {
    position: absolute;
    z-index: 100;
    left: -4px;
    top: -4px;
    height: 32px;
    width: 32px;
    border-radius: 16px;
    background: #262e2f;
    color: white;
    outline: 1px solid #414141;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, .15);
    transition: background .2s cubic-bezier(.25, 0, 0, 1),
                outline .2s cubic-bezier(.25, 0, 0, 1),
                box-shadow .2s cubic-bezier(.25, 0, 0, 1),
                opacity .2s cubic-bezier(.25, 0, 0, 1);
  }

  button.expander:hover {
    background: #22292a;
    outline-width: 3px;
    opacity: 1 !important;
  }

  .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    align-items: stretch;
    justify-content: flex-start;
    overflow: hidden;
    border-top-left-radius: 16px;
    border-bottom-left-radius: 16px;
    transition: opacity .15s cubic-bezier(.25, 0, 0, 1);
  }

  .box.collapsed .content {
    opacity: 0;
  }

  .box.collapsed button.expander {
    box-shadow: 0 2px 4px rgba(0, 0, 0, .15);
    opacity: .75;
  }

  .ai-icon {
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font: 700 32px Inter, monospace;
    color: #22292a;
    pointer-events: none;
    padding: 0;
    margin: 0;
    align-self: center;
    opacity: 0;
    transition: opacity .5s cubic-bezier(.25, 0, 0, 1);
  }

  .box.collapsed .ai-icon {
    opacity: 1;
  }

  .header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    background: #2d3236;
    border-bottom: 1px solid #414141;
  }

  .header h3 {
    font: 500 16px Inter, sans-serif;
    color: white;
  }
</style>
