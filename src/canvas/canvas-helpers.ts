export const withCanvas = (
  canvas: HTMLCanvasElement,
  callback: (
    canvasCtx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => void
) => {
  if (!canvas) {
    return;
  }

  const canvas2dContext = canvas.getContext('2d');
  callback(canvas2dContext, canvas);
};

export const drawBlockGrid = (
  context2D: CanvasRenderingContext2D,
  canvasRect: { height: number; width: number },
  blockSize: number
) => {
  if (blockSize < 1) {
    return;
  }

  context2D.clearRect(0, 0, canvasRect.width, canvasRect.height);
  context2D.beginPath();

  const offset = 0.5;

  for (let wIndex = 0; wIndex < canvasRect.width; wIndex += blockSize) {
    context2D.moveTo(wIndex + offset, offset);
    context2D.lineTo(wIndex + offset, canvasRect.height + offset);
  }
  for (let hIndex = 0; hIndex < canvasRect.height; hIndex += blockSize) {
    context2D.moveTo(offset, hIndex + offset);
    context2D.lineTo(canvasRect.width + offset, hIndex + offset);
  }
  context2D.stroke();
};

// https://gist.github.com/callumlocke/cc258a193839691f60dd
export const adjustCanvasDPI = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  canvasRect: { height: number; width: number }
) => {
  // assume the device pixel ratio is 1 if the browser doesn't specify it
  const devicePixelRatio = window.devicePixelRatio || 1;

  // determine the 'backing store ratio' of the canvas context
  const backingStoreRatio =
    (context as any).webkitBackingStorePixelRatio ||
    (context as any).mozBackingStorePixelRatio ||
    (context as any).msBackingStorePixelRatio ||
    (context as any).oBackingStorePixelRatio ||
    (context as any).backingStorePixelRatio ||
    1;

  // determine the actual ratio we want to draw at
  const ratio = devicePixelRatio / backingStoreRatio;

  if (devicePixelRatio !== backingStoreRatio) {
    // set the 'real' canvas size to the higher width/height
    canvas.width = canvasRect.width * ratio;
    canvas.height = canvasRect.height * ratio;

    // ...then scale it back down with CSS
    canvas.style.width = canvasRect.width + 'px';
    canvas.style.height = canvasRect.height + 'px';
  } else {
    // this is a normal 1:1 device; just scale it simply
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;
    canvas.style.width = '';
    canvas.style.height = '';
  }

  // scale the drawing context so everything will work at the higher ratio
  context.scale(ratio, ratio);
};
