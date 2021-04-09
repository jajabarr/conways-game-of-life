import { withCanvas } from './canvas/canvas-helpers';
import { isEqual } from 'lodash';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import type { Subscription } from 'rxjs';

export class Grid<T> implements IGrid<T> {
  public grid: IGridData<T> = {};
  private onChange$ = new Subject<GridChangeEvent<T>>();
  private blockSize: number;
  private width: number;
  private height: number;

  constructor(dimensions: IGridDimensions, private canvas?: HTMLCanvasElement) {
    this.blockSize = dimensions.blockSize;
    this.width = dimensions.width;
    this.height = dimensions.height;
  }

  subscribe(callback: (payload: GridChangeEvent<T>) => void): Subscription {
    return this.onChange$
      .pipe(distinctUntilChanged(isEqual))
      .subscribe({ next: callback });
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.onChange$.next({
      type: 'canvas',
      payload: canvas
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  dimensions(): { blockSize: number; width: number; height: number } {
    return {
      blockSize: this.blockSize,
      width: this.width,
      height: this.height
    };
  }

  resize(dimensions: IGridDimensions): void {
    this.blockSize = dimensions.blockSize;
    this.width = dimensions.width;
    this.height = dimensions.height;

    this.onChange$.next({
      type: 'dimension',
      payload: dimensions
    });
  }

  iterate(callback: (x: number, y: number, value: T) => void) {
    const yAxis = Object.keys(this.grid);
    for (let _y of yAxis) {
      let y = +_y;
      for (let _x of Object.keys(this.grid[y])) {
        let x = +_x;
        callback(x, y, this.grid[_y][_x]);
      }
    }
  }

  copy(other: IGrid<T>) {
    this.iterate((x, y, value) => {
      other.set(x, y, value);
    });
  }

  clear(): void {
    this.grid = {};
  }

  set(x: number, y: number, value: T): T | undefined {
    if (!between(x, 0, this.width) || !between(y, 0, this.height)) {
      return undefined;
    }

    this.onChange$.next({
      type: 'block',
      payload: {
        x,
        y,
        value
      }
    });

    if (this.grid?.[y]?.[x] !== undefined) {
      this.grid[y][x] = value;
    } else {
      if (this.grid[y]) {
        this.grid[y][x] = value;
      } else {
        this.grid[y] = { [x]: value };
      }
    }

    return value;
  }

  remove(x: number, y: number) {
    if (this.get(x, y) !== undefined) {
      delete this.grid[y][x];

      if (Object.keys(this.grid[y]).length === 0) {
        delete this.grid[y];
      }
    }
  }

  get(x: number, y: number): T | undefined {
    return this.grid?.[y]?.[x];
  }

  drawBlock(
    x: number,
    y: number,
    color?: string,
    canvas?: HTMLCanvasElement
  ): void {
    withCanvas(canvas || this.canvas, (context2D) => {
      if (color === undefined) {
        context2D.clearRect(
          x * this.blockSize,
          y * this.blockSize,
          this.blockSize,
          this.blockSize
        );
      } else {
        context2D.save();
        context2D.fillStyle = color;
        context2D.fillRect(
          x * this.blockSize,
          y * this.blockSize,
          this.blockSize,
          this.blockSize
        );
        context2D.restore();
      }
    });
  }

  drawGrid(
    color?: string,
    canvas?: HTMLCanvasElement,
    rules: IGridDrawRule<T> = []
  ): void {
    withCanvas(canvas || this.canvas, (_context2D, canvas) => {
      this.iterate((x, y, value) => {
        const rule = rules.filter((r) => isEqual(value, r.key));

        if (rule.length > 0) {
          const { color: ruleColor, destroy } = rule[0];
          this.drawBlock(x, y, color || ruleColor, canvas);

          if (destroy) {
            this.remove(x, y);
          }
        } else {
          this.drawBlock(x, y, color, canvas);
        }
      });
    });
  }
}
