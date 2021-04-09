<script lang="typescript">
  import { getAnimationEvent$, getFPS$ } from './events/raf';
  import { grid, displayGrid } from './Canvas.svelte';
  import { makeNextGeneration } from './generation';
  import NumberSelector from './NumberSelector.svelte';
  import { onMount } from 'svelte';
  import { Fade } from './fade';
  import type { Subscription } from 'rxjs';

  let isRunning: boolean = false;
  let showGrid: boolean = true;
  let animate: boolean = false;
  let unsubscribeRAF$: Subscription | undefined;
  let unsubscribeFPS$: Subscription | undefined;

  let generationGrid: Grid<BlockValue> = new Grid(
    grid.dimensions(),
    grid.getCanvas()
  );
  let fader = new Fade(grid);
  let frameRate = 0;
  let fps = 0;

  function copyGrid(items: 'grid' | 'fader' | 'both') {
    grid.iterate((x, y, value) => {
      if (value > 0) {
        switch (items) {
          case 'grid':
            generationGrid.set(x, y, value);
            break;
          case 'fader':
            fader.set(x, y);
            break;
          case 'both':
            generationGrid.set(x, y, value);
            fader.set(x, y);
            break;
        }
      }
    });
  }

  function run() {
    generationGrid = makeNextGeneration(generationGrid, fader);
    generationGrid.drawGrid(undefined, undefined, [
      { key: -1, destroy: true },
      { key: 1, color: 'black' }
    ]);
  }

  function reset(clear: boolean = false) {
    isRunning = false;

    generationGrid.drawGrid('white');

    fader.clear();
    generationGrid.clear();

    copyGrid('both');

    if (clear) {
      grid.clear();
    } else {
      generationGrid.drawGrid('black');
    }
  }

  onMount(() => {
    const unsubscribeGridResize: Subscription = grid.subscribe(
      (event: GridChangeEvent<BlockValue>) => {
        isRunning = false;

        if (isGridDimensionEvent(event)) {
          generationGrid.resize(event.payload);
          fader.resize(event.payload);
        } else if (isGridBlockEvent(event)) {
          const { x, y, value } = event.payload;
          if (value > 0) {
            fader.set(x, y);
            generationGrid.set(x, y, value);
          } else {
            fader.remove(x, y);
            generationGrid.remove(x, y);
          }
        } else if (isGridCanvasEvent(event)) {
          generationGrid.setCanvas(event.payload);
          fader.setCanvas(event.payload);
        }
      }
    );

    return () => {
      unsubscribeGridResize.unsubscribe();
    };
  });

  $: {
    if (unsubscribeFPS$) {
      unsubscribeFPS$.unsubscribe();
    }

    if (animate) {
      if (isRunning) {
        fader.clear();
        fader.animate();
      } else {
        fader.clear();
      }
    } else {
      fader.clear();
    }

    if (isRunning) {
      unsubscribeFPS$ = getFPS$().subscribe((_fps) => (fps = _fps));
    }
  }

  $: {
    if (unsubscribeRAF$) {
      unsubscribeRAF$.unsubscribe();
    }

    if (isRunning) {
      unsubscribeRAF$ = getAnimationEvent$(frameRate).subscribe(run);
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
<div>
  <span>Animate: </span><input type="checkbox" bind:checked={animate} />
</div>

<button on:click={() => (isRunning = !isRunning)}>
  {isRunning ? 'Pause' : 'Start'}
</button>

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
