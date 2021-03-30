import { animationFrameScheduler, interval, scheduled } from 'rxjs';
import { repeat, map, throttle } from 'rxjs/operators';

import type { Observable } from 'rxjs';

export function getAnimationEvent$(frameRate: number = 16) {
  const $animationEvent: Observable<number> = scheduled(
    [animationFrameScheduler.now()],
    animationFrameScheduler
  ).pipe(
    repeat(),
    map((start) => animationFrameScheduler.now() - start),
    throttle(() => interval(frameRate))
  );

  return $animationEvent;
}
