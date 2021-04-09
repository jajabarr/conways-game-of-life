interface Coordinate {
  x: number;
  y: number;
}

type BlockValue = -1 | 1;

type GridBlockUpdate<T> = Coordinate & { value: T };

interface IGridData<T> {
  [key: number]: {
    [key: number]: T;
  };
}

interface IGridDimensions {
  blockSize: number;
  width: number;
  height: number;
}

type GridChangeEventType = 'block' | 'dimension' | 'canvas';
type GridChangeEvent<T> = {
  type: GridChangeEventType;
  payload: IGridDimensions | GridBlockUpdate<T> | HTMLCanvasElement;
};

type IGridDrawRule<T> = {
  key: T;
  color?: string;
  destroy?: boolean;
}[];

interface IGrid<T> {
  grid: IGridData;
  copy(other: IGrid<T>);
  subscribe(
    callback: (payload: GridChangeEventPayload<T>) => void
  ): Subscription;
  setCanvas(canvas: HTMLCanvasElement);
  getCanvas(): HTMLCanvasElement;
  resize(dimensions: IGridDimensions): void;
  dimensions(): IGridDimensions;
  iterate(callback: (x: number, y: number, value: T) => void);
  clear(): void;
  set: (x: number, y: number, value: T) => T | undefined;
  get: (x: number, y: number) => T | undefined;
  remove(x: number, y: number);
  drawBlock(
    x: number,
    y: number,
    color: string,
    canvas?: HTMLCanvasElement
  ): void;
  drawGrid(
    color?: string,
    canvas?: HTMLCanvasElement,
    rules: IGridDrawRule<T> = []
  ): void;
}

declare function between(value: number, lhs: number, rhs: number): boolean;
declare function isGridDimensionEvent<T>(
  event: GridChangeEvent<T>
): event is {
  type: 'dimension';
  payload: IGridDimensions;
};

declare function isGridBlockEvent<T>(
  event: GridChangeEvent<T>
): event is {
  type: 'block';
  payload: GridBlockUpdate<T>;
};

declare function isGridCanvasEvent<T>(
  event: GridChangeEvent<T>
): event is {
  type: 'canvas';
  payload: HTMLCanvasElement;
};
declare class Grid<T> implements IGrid {
  grid: IGridData;
  constructor(dimensions: IGridDimensions, canvas?: HTMLCanvasElement);
  copy(other: IGrid<T>);
  subscribe(
    callback: (payload: GridChangeEventPayload<T>) => void
  ): Subscription;
  setCanvas(canvas: HTMLCanvasElement);
  getCanvas(): HTMLCanvasElement;
  resize(dimensions: IGridDimensions): void;
  dimensions(): IGridDimensions;
  iterate(callback: (x: number, y: number, value: T) => void);
  clear(): void;
  set: (x: number, y: number, value: T) => T | undefined;
  remove(x: number, y: number);
  get: (x: number, y: number) => T | undefined;
  drawBlock(
    x: number,
    y: number,
    color: string,
    canvas?: HTMLCanvasElement
  ): void;
  drawGrid(
    color?: string,
    canvas?: HTMLCanvasElement,
    rules: IGridDrawRule<T> = []
  ): void;
}
