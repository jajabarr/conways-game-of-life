function _between(value: number, lhs: number, rhs: number) {
  return lhs <= value && value <= rhs;
}

(window as any).between = _between;

class Grid implements IGrid {
  public grid: IGridData = {};

  constructor(
    private blockSize: number,
    private width: number,
    private height: number
  ) {}

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
  }

  iterate(callback: (x: number, y: number) => void) {
    const yAxis = Object.keys(this.grid);
    for (let _y of yAxis) {
      let y = +_y;
      for (let _x of Object.keys(this.grid[y])) {
        let x = +_x;
        callback(x, y);
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
    context2D: CanvasRenderingContext2D,
    x: number,
    y: number,
    color?: string
  ): void {
    const blockData = this.get(x, y);

    context2D.fillStyle = color ? color : blockData < 0 ? 'white' : 'black';
    context2D.fillRect(
      x * this.blockSize + 1,
      y * this.blockSize + 1,
      this.blockSize - 1,
      this.blockSize - 1
    );
  }

  drawGrid(context2D: CanvasRenderingContext2D, color?: string): void {
    this.iterate((x, y) => {
      this.drawBlock(context2D, x, y, color);
    });
  }
}

(window as any).Grid = Grid;

export {};
