import { Grid } from './grid';

function _between(value: number, lhs: number, rhs: number) {
  return lhs <= value && value <= rhs;
}

(window as any).between = _between;

(window as any).Grid = Grid;

export {};
