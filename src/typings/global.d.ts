interface Coordinate {
  x: number;
  y: number;
}

type BlockValue = -1 | 1;

interface IGridData {
  [key: number]: {
    [key: number]: BlockValue;
  };
}

interface IGrid {
  grid: IGridData;
  resize(blockSize: number, width: number, height: number): void;
  dimensions(): { blockSize: number; width: number; height: number };
  iterate(callback: (x: number, y: number) => void);
  clear(): void;
  set: (x: number, y: number, value: BlockValue) => BlockValue | undefined;
  get: (x: number, y: number) => BlockValue | undefined;
  flip(x: number, y: number): BlockValue | undefined;
  drawBlock(
    context2D: CanvasRenderingContext2D,
    x: number,
    y: number,
    color?: string
  ): void;
  drawGrid(context2D: CanvasRenderingContext2D, color?: string): void;
}

declare function between(value: number, lhs: number, rhs: number): boolean;
declare class Grid implements IGrid {
  grid: IGridData;
  constructor(blockSize: number, width: number, height: number);
  resize(blockSize: number, width: number, height: number): void;
  dimensions(): { blockSize: number; width: number; height: number };
  iterate(callback: (x: number, y: number) => void);
  clear(): void;
  set: (x: number, y: number, value: BlockValue) => BlockValue | undefined;
  get: (x: number, y: number) => BlockValue | undefined;
  flip(x: number, y: number): BlockValue | undefined;
  drawBlock(
    context2D: CanvasRenderingContext2D,
    x: number,
    y: number,
    color?: string
  ): void;
  drawGrid(context2D: CanvasRenderingContext2D, color?: string): void;
}
