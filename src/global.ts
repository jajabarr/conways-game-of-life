import { Grid } from './grid';

function _between(value: number, lhs: number, rhs: number) {
  return lhs <= value && value <= rhs;
}

function isGridDimensionEvent<T>(
  event: GridChangeEvent<T>
): event is {
  type: 'dimension';
  payload: IGridDimensions;
} {
  return event.type == 'dimension';
}

function isGridBlockEvent<T>(
  event: GridChangeEvent<T>
): event is {
  type: 'block';
  payload: IGridDimensions;
} {
  return event.type == 'block';
}

function isGridCanvasEvent<T>(
  event: GridChangeEvent<T>
): event is {
  type: 'canvas';
  payload: IGridDimensions;
} {
  return event.type == 'canvas';
}

(window as any).between = _between;
(window as any).Grid = Grid;
(window as any).isGridDimensionEvent = isGridDimensionEvent;
(window as any).isGridBlockEvent = isGridBlockEvent;
(window as any).isGridCanvasEvent = isGridCanvasEvent;

export {};
