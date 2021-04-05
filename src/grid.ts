import { withCanvas } from './canvas/canvas-helpers';

export class Grid implements IGrid {
  public grid: IGridData = {};

  constructor(
    private blockSize: number,
    private width: number,
    private height: number,
    private canvas?: HTMLCanvasElement
  ) {}

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
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

  resize(blockSize: number, width: number, height: number): void {
    this.blockSize = blockSize;
    this.width = width;
    this.height = height;

    const newGrid: IGrid = new Grid(blockSize, width, height);

    this.iterate((x, y, value) => {
      newGrid.set(x % width, y % height, value);
    });

    this.grid = newGrid.grid;
  }

  iterate(callback: (x: number, y: number, value: BlockValue) => void) {
    const yAxis = Object.keys(this.grid);
    for (let _y of yAxis) {
      let y = +_y;
      for (let _x of Object.keys(this.grid[y])) {
        let x = +_x;
        callback(x, y, this.grid[_y][_x]);
      }
    }
  }

  clear(): void {
    this.grid = {};
  }

  set(x: number, y: number, value: BlockValue): BlockValue | undefined {
    if (!between(x, 0, this.width) || !between(y, 0, this.height)) {
      return undefined;
    }

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

  get(x: number, y: number): BlockValue | undefined {
    return this.grid?.[y]?.[x];
  }

  flip(x: number, y: number): BlockValue | undefined {
    if (!between(x, 0, this.width) || !between(y, 0, this.height)) {
      return undefined;
    }

    let blockData = this.get(x, y);

    if (!!blockData) {
      blockData = (blockData * -1) as BlockValue;
      this.set(x, y, blockData);
    } else {
      blockData = 1;
      this.set(x, y, 1);
    }

    return blockData;
  }

  drawBlock(
    x: number,
    y: number,
    color?: string,
    canvas?: HTMLCanvasElement
  ): void {
    const blockData = this.get(x, y);

    withCanvas(canvas || this.canvas, (context2D) => {
      context2D.save();
      context2D.fillStyle = color || 'black';

      if (blockData > 0) {
        context2D.fillRect(
          x * this.blockSize + 1,
          y * this.blockSize + 1,
          this.blockSize - 1,
          this.blockSize - 1
        );
      } else {
        context2D.clearRect(
          x * this.blockSize,
          y * this.blockSize,
          this.blockSize,
          this.blockSize
        );
      }

      context2D.restore();
    });
  }

  drawGrid(color?: string, canvas?: HTMLCanvasElement): void {
    withCanvas(canvas || this.canvas, (context2D, canvas) => {
      this.iterate((x, y) => {
        this.drawBlock(x, y, color, canvas);
      });
    });
  }
}
