<script lang="typescript" context="module">
  export let canvas: HTMLCanvasElement;
  export const grid: Grid = new Grid(0, 0, 0);
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
  import type { Subscription } from 'rxjs';

  export let blockSize: number;

  let wrapper: HTMLDivElement;
  let gridLines: HTMLCanvasElement;
  let _canvas: HTMLCanvasElement;

  let unsubscribeMouseDown$: Subscription | undefined;

  $: canvasRect = {
    height: wrapper?.clientHeight - (wrapper?.clientHeight % blockSize) || 0,
    width: wrapper?.clientWidth - (wrapper?.clientWidth % blockSize) || 0
  };

  function onMouseDown(event: Coordinate) {
    grid.flip(event.x, event.y);

    withCanvas(_canvas, (context2D) => {
      grid.drawBlock(context2D, event.x, event.y);
    });
  }

  $: {
    if (unsubscribeMouseDown$) {
      unsubscribeMouseDown$.unsubscribe();
    }

    grid.resize(
      blockSize,
      Math.floor(canvasRect.width / blockSize),
      Math.floor(canvasRect.height / blockSize)
    );

    withCanvas(gridLines, (context2D) => {
      adjustCanvasDPI(gridLines, context2D, canvasRect);
      drawBlockGrid(context2D, canvasRect, blockSize);
    });

    withCanvas(_canvas, (context2D) => {
      adjustCanvasDPI(_canvas, context2D, canvasRect);

      unsubscribeMouseDown$ = getMouseDownOnElement$(
        gridLines,
        blockSize
      ).subscribe(onMouseDown);

      grid.drawGrid(context2D);

      canvas = _canvas;
    });
  }
</script>

<div id="main-board" bind:this={wrapper}>
  <div
    id="wrapper-board"
    style="height: {canvasRect.height}px; width: {canvasRect.width}px"
  >
    <canvas bind:this={_canvas} id="main-canvas" />
    <canvas id="grid" bind:this={gridLines} class={blockSize ? 'border' : ''} />
  </div>
</div>

<style>
  div#main-board {
    height: 90%;
    width: 90%;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  div#wrapper-board {
    position: relative;
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
