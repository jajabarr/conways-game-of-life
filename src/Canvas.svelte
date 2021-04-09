<script lang="typescript" context="module">
  export const grid: Grid<BlockValue> = new Grid({
    blockSize: 0,
    width: 0,
    height: 0
  });
  export const displayGrid = (state: boolean) => {
    const gridCanvas: HTMLCanvasElement = document.querySelector('#grid');

    if (gridCanvas) {
      gridCanvas.style.visibility = state ? 'visible' : 'hidden';
    }
  };
</script>

<script lang="typescript">
  import {
    adjustCanvasDPI,
    withCanvas,
    drawBlockGrid
  } from './canvas/canvas-helpers';
  import { getMouseDownOnElement$ } from './events/mouse';
  import { getWindowResize$ } from './events/resize';
  import type { Subscription } from 'rxjs';
  import { onMount } from 'svelte';

  export let blockSize: number;

  let wrapper: HTMLDivElement;
  let gridLines: HTMLCanvasElement;
  let canvas: HTMLCanvasElement;
  let canvasRect: { height: number; width: number } = { height: 0, width: 0 };

  let unsubscribeMouseDown$: Subscription | undefined;

  function onMouseDown(event: Coordinate) {
    const blockValue = ((grid.get(event.x, event.y) ?? -1) * -1) as BlockValue;

    grid.set(event.x, event.y, blockValue);
    grid.drawBlock(event.x, event.y, blockValue > 0 ? 'black' : 'white');
  }

  function onWindowResize() {
    canvasRect = {
      height: wrapper?.clientHeight - (wrapper?.clientHeight % blockSize) || 0,
      width: wrapper?.clientWidth - (wrapper?.clientWidth % blockSize) || 0
    };

    resize(true /* fromWindow */);
  }

  function resize(fromWindow: boolean = false) {
    if (unsubscribeMouseDown$) {
      unsubscribeMouseDown$.unsubscribe();
    }

    grid.resize({
      blockSize,
      width: Math.floor(canvasRect.width / blockSize),
      height: Math.floor(canvasRect.height / blockSize)
    });

    withCanvas(gridLines, (context2D) => {
      adjustCanvasDPI(gridLines, context2D, canvasRect);
      drawBlockGrid(context2D, canvasRect, blockSize);
    });

    withCanvas(canvas, (context2D) => {
      adjustCanvasDPI(canvas, context2D, canvasRect);

      unsubscribeMouseDown$ = getMouseDownOnElement$(
        canvas,
        blockSize
      ).subscribe(onMouseDown);
    });

    if (!fromWindow) {
      grid.drawGrid('black');
    }
  }

  onMount(() => {
    grid.setCanvas(canvas);

    const unsubscribeWindowResize$: Subscription = getWindowResize$().subscribe(
      onWindowResize
    );

    return () => {
      unsubscribeMouseDown$.unsubscribe();
      unsubscribeWindowResize$.unsubscribe();
    };
  });

  $: {
    canvasRect = {
      height: wrapper?.clientHeight - (wrapper?.clientHeight % blockSize) || 0,
      width: wrapper?.clientWidth - (wrapper?.clientWidth % blockSize) || 0
    };

    resize();
  }
</script>

<div id="main-board" bind:this={wrapper}>
  <div
    id="wrapper-board"
    style="height: {canvasRect.height}px; width: {canvasRect.width}px"
  >
    <canvas bind:this={canvas} id="main-canvas" />
    <canvas id="grid" bind:this={gridLines} class={blockSize ? 'border' : ''} />
  </div>
</div>

<style>
  div#main-board {
    height: 90vh;
    width: 90vw;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  div#wrapper-board {
    position: relative;
  }

  canvas#grid {
    pointer-events: none;
  }

  .border {
    border-bottom: 0.5px solid black;
    border-right: 0.5px solid black;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }
</style>
