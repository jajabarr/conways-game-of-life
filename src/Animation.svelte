<script lang="typescript">
  import { getAnimationEvent$ } from './events/raf';
  import { grid, displayGrid } from './Canvas.svelte';
  import { makeNextGeneration } from './generation';
  import NumberSelector from './NumberSelector.svelte';
  import type { Subscription } from 'rxjs';

  let isRunning: boolean = false;
  let showGrid: boolean = true;
  let unsubscribeRAF$: Subscription | undefined;
  let generationGrid: Grid = grid;

  let frameRate = 0;

  function nextGeneration() {
    generationGrid.drawGrid('white');
    generationGrid = makeNextGeneration(generationGrid);
    generationGrid.drawGrid();
  }

  function reset(clear: boolean = false) {
    isRunning = false;

    generationGrid.drawGrid('white');

    if (clear) {
      grid.clear();
    } else {
      grid.drawGrid();
    }
    generationGrid = grid;
  }

  $: {
    if (unsubscribeRAF$) {
      unsubscribeRAF$.unsubscribe();
    }

    if (isRunning) {
      unsubscribeRAF$ = getAnimationEvent$(frameRate).subscribe(nextGeneration);
    }
  }

  $: {
    displayGrid(showGrid);
  }
</script>

<button on:click={() => reset()}>Reset</button>
<button on:click={() => reset(true /* clear */)}>Clear</button>
<NumberSelector bind:value={frameRate} title="Frame delay (ms): " />
<div>
  <span>Show grid: </span><input type="checkbox" bind:checked={showGrid} />
</div>

<button on:click={() => (isRunning = !isRunning)}
  >{isRunning ? 'Pause' : 'Start'}</button
>

<style>
  div {
    display: 'flex';
    justify-content: center;
    flex-direction: row;
    align-items: center;

    margin-right: 10px;
  }

  span {
    text-transform: uppercase;
  }

  button {
    margin-right: 10px;
  }
</style>
