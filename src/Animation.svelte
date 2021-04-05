<script lang="typescript">
  import { animationEvent$, getAnimationEvent$, getFPS$ } from './events/raf';
  import { getWindowResize$ } from './events/resize';
  import { grid, displayGrid } from './Canvas.svelte';
  import { makeNextGeneration } from './generation';
  import NumberSelector from './NumberSelector.svelte';
  import { onMount } from 'svelte';
  import { tap, debounce } from 'rxjs/operators';
  import type { Subscription } from 'rxjs';

  let isRunning: boolean = false;
  let showGrid: boolean = true;
  let unsubscribeRAF$: Subscription | undefined;
  let unsubscriptFPS$: Subscription | undefined;

  let generationGrid: Grid = grid;

  let frameRate = 0;
  let fps = 0;

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

  onMount(() => {
    // TODO: sometimes this causes blocks to disappear
    const unsubscribeWindowResize$: Subscription = getWindowResize$()
      .pipe(
        tap(() => {
          isRunning = false;
          const { blockSize, width, height } = grid.dimensions();
          generationGrid.resize(blockSize, width, height);
        }),
        debounce(() => animationEvent$),
        tap(() => {
          isRunning = true;
        })
      )
      .subscribe();

    return () => {
      unsubscribeWindowResize$.unsubscribe();
    };
  });

  $: {
    if (unsubscribeRAF$) {
      unsubscribeRAF$.unsubscribe();
    }

    if (unsubscriptFPS$) {
      unsubscriptFPS$.unsubscribe();
    }

    if (isRunning) {
      unsubscribeRAF$ = getAnimationEvent$(frameRate).subscribe(nextGeneration);
      unsubscriptFPS$ = getFPS$().subscribe((_fps) => (fps = _fps));
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
<span>FPS: {fps}</span>

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
