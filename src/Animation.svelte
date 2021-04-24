<script lang="typescript">
  import { getAnimationEvent$, getFPS$, withFPS$ } from './events/raf';
  import { grid, displayGrid } from './Canvas.svelte';
  import { makeNextGeneration } from './generation';
  import NumberSelector from './NumberSelector.svelte';
  import { onMount } from 'svelte';
  import { Fade } from './fade';
  import type { Subscription } from 'rxjs';

  let RAFSubscription$: Subscription | undefined;
  let GenerationGrid = new Grid<BlockValue>(
    grid.dimensions(),
    grid.getCanvas()
  );
  let Fader = new Fade(grid);
  const FPS = { current: 0 };

  // Reactors
  let isRunning: boolean = false;
  let showGrid: boolean = true;
  let animate: boolean = false;
  let frameRate = 0;
  let fps = 0;

  function start() {
    isRunning = true;
    subscribeRAF$();

    if (animate) {
      Fader.animate();
    }
  }

  function drawGenerationalGrid() {
    GenerationGrid.drawGrid(undefined, undefined, [
      { key: -1, destroy: true },
      { key: 1, color: 'black' }
    ]);
  }

  function stop() {
    isRunning = false;
    RAFSubscription$?.unsubscribe();
    Fader.stop();
    GenerationGrid.drawGrid('black');
  }

  function subscribeRAF$() {
    if (RAFSubscription$) {
      console.log('Grid unsubscribe');
      RAFSubscription$.unsubscribe();
    }

    RAFSubscription$ = withFPS$(getAnimationEvent$(frameRate), FPS).subscribe(
      run
    );
  }

  function copyGrid(items: 'grid' | 'fader' | 'both') {
    grid.iterate((x, y, value) => {
      if (value > 0) {
        switch (items) {
          case 'grid':
            GenerationGrid.set(x, y, value);
            break;
          case 'fader':
            Fader.set(x, y);
            break;
          case 'both':
            GenerationGrid.set(x, y, value);
            Fader.set(x, y);
            break;
        }
      }
    });
  }

  function run() {
    fps = FPS.current;
    GenerationGrid = makeNextGeneration(GenerationGrid, Fader, animate);
    drawGenerationalGrid();
  }

  function reset(clear: boolean = false) {
    isRunning = false;
    RAFSubscription$?.unsubscribe();

    GenerationGrid.drawGrid('white');

    Fader.clear();
    GenerationGrid.clear();

    if (clear) {
      grid.clear();
    } else {
      copyGrid('both');
      GenerationGrid.drawGrid('black');
    }
  }

  onMount(() => {
    const unsubscribeGridResize: Subscription = grid.subscribe(
      (event: GridChangeEvent<BlockValue>) => {
        console.log(event);
        isRunning = false;

        if (isGridDimensionEvent(event)) {
          GenerationGrid.resize(event.payload);
          Fader.resize(event.payload);
        } else if (isGridBlockEvent(event)) {
          const { x, y, value } = event.payload;
          if (value > 0) {
            Fader.set(x, y);
            GenerationGrid.set(x, y, value);
          } else {
            Fader.remove(x, y);
            GenerationGrid.remove(x, y);
          }
        } else if (isGridCanvasEvent(event)) {
          GenerationGrid.setCanvas(event.payload);
          Fader.setCanvas(event.payload);
        }
      }
    );

    return () => {
      unsubscribeGridResize.unsubscribe();
    };
  });

  $: {
    if (animate) {
      Fader.clear();
      Fader.animate();
    } else {
      Fader.clear();
      drawGenerationalGrid();
    }
  }

  $: {
    frameRate && subscribeRAF$();
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

<button on:click={isRunning ? stop : start}>
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
