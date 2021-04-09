import { animationFrameScheduler, interval, scheduled } from 'rxjs';
import { repeat, map, throttle, share, scan } from 'rxjs/operators';

import type { Observable } from 'rxjs';

export interface IRaf {
  timeSinceStart: number;
  lastTimestamp: number;
  frameDistance: number;
}

export const animationEvent$: Observable<number> = interval(
  0,
  animationFrameScheduler
).pipe(share());

export function getAnimationEvent$(frameRate: number = 16): Observable<number> {
  return animationEvent$.pipe(throttle(() => interval(frameRate)));
}

export function getFPS$(): Observable<number> {
  return animationEvent$.pipe(
    map(() => {
      const now = animationFrameScheduler.now();

      return {
        lastTimestamp: now,
        frameDistance: 0
      };
    }),
    scan((acc, cur) => {
      const { lastTimestamp } = acc;

      return {
        lastTimestamp: cur.lastTimestamp,
        frameDistance: cur.lastTimestamp - lastTimestamp
      };
    }),
    map(({ frameDistance }) => Math.ceil(1000 / frameDistance)),
    throttle(() => interval(250))
  );
}
