import { fromEvent } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import type { Observable } from 'rxjs';

export interface IMouseEvent {
  x: number;
  y: number;
}

export const getMouseDownOnElement$ = (
  elementRef: HTMLElement,
  blockSize: number
) => {
  const mouseDown$: Observable<Coordinate> = fromEvent<MouseEvent>(
    document,
    'mousedown'
  ).pipe(
    filter((event: MouseEvent) => event.target === elementRef),
    map((event: MouseEvent) => {
      const rect = elementRef.getBoundingClientRect();

      if (!rect) {
        return { x: -1, y: -1 };
      }

      const { x, y, top, bottom, right, left } = rect;

      const [mX, mY] = [event.clientX, event.clientY];

      if (!between(mX, left, right) || !between(mY, top, bottom)) {
        return { x: -1, y: -1 };
      }

      const yCoord = Math.floor(Math.abs(mY - y) / blockSize);
      const xCoord = Math.floor(Math.abs(mX - x) / blockSize);

      return { x: xCoord, y: yCoord };
    }),
    filter(({ x, y }) => x >= 0 && y >= 0)
  );

  return mouseDown$;
};
