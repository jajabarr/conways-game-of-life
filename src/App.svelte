<script lang="ts">
  import NumberSelector from './NumberSelector.svelte';
  import Canvas from './Canvas.svelte';
  import Animation from './Animation.svelte';

  $: blockSize = 0;
</script>

<main>
  <div id="menu-group">
    <NumberSelector bind:value={blockSize} title={'Block Size: '} />
    <Animation />
  </div>

  <Canvas {blockSize} />
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
  }

  div#menu-group {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    align-self: flex-start;
    margin-left: 5%;
    margin-top: 10px;
    margin-bottom: 10px;
  }
</style>
