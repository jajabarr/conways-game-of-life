import { getAnimationEvent$ } from './events/raf';
import type { Subscription } from 'rxjs';

interface ColorBlock {
  r: number;
  g: number;
  b: number;
}

interface AlphaColorBlock extends ColorBlock {
  a: number;
}

function phaser(refs: {
  0: number;
  1: number;
  direction: 0 | 1;
  color: 0 | 1;
}) {
  refs[refs.color] =
    refs.direction == 0 ? ++refs[refs.color] % 256 : --refs[refs.color];

  if (refs.direction === 0 && refs[refs.color] === 255) {
    refs.direction = 1;
  }

  if (refs.direction == 1 && refs[refs.color] === 0) {
    refs.direction = 0;
  }

  return refs;
}

export function* GreenBlueShift(): Generator<ColorBlock, never, never> {
  const refs = {
    0: 255,
    1: 0,
    direction: 0 as 0 | 1,
    color: 1 as 0 | 1
  };

  while (true) {
    const { 0: b, 1: g } = phaser(refs);

    yield {
      r: 0,
      g: g,
      b: b
    };
  }
}

export class Fade {
  private grid: Grid<AlphaColorBlock>;
  private rafSubscription$: Subscription | undefined;
  constructor(
    baseGrid: Grid<any>,
    private colorFn: Generator<ColorBlock, never, never> = GreenBlueShift()
  ) {
    this.grid = new Grid<AlphaColorBlock>(
      baseGrid.dimensions(),
      baseGrid.getCanvas()
    );
    baseGrid.iterate((x, y, value) => {
      this.grid.set(x, y, value);
    });
  }

  draw(): void {
    this.grid.iterate((x, y, value) => {
      const nextLinearValue = (value.a -= 0.1);

      this.grid.drawBlock(x, y, 'white');
      this.grid.drawBlock(
        x,
        y,
        `rgba(${value.r}, ${
          value.g + (Math.floor(Math.random() * 100) % 256)
        }, ${
          value.b + (Math.floor(Math.random() * 100) % 256)
        }, ${nextLinearValue})`
      );

      if (nextLinearValue <= 0) {
        this.grid.drawBlock(x, y, 'white');
        this.remove(x, y);
      } else {
        this.grid.set(x, y, { ...value, a: nextLinearValue });
      }
    });
  }

  resize(dimensions: IGridDimensions): void {
    this.grid.resize(dimensions);
  }

  clear(): void {
    this.stop();
    this.grid.drawGrid('white');
    this.grid.clear();
  }

  stop(): void {
    if (this.rafSubscription$) {
      this.rafSubscription$.unsubscribe();
    }
  }

  animate(): void {
    this.stop();
    this.rafSubscription$ = getAnimationEvent$(25).subscribe(() => this.draw());
  }

  set(x: number, y: number): void {
    this.grid.set(x, y, { ...this.colorFn.next().value, a: 1 });
  }

  remove(x: number, y: number): void {
    this.grid.remove(x, y);
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.grid.setCanvas(canvas);
  }
}
