import { fromEvent, Observable } from 'rxjs';
import { map, debounce } from 'rxjs/operators';
import { animationEvent$ } from './raf';

export interface IResizeEvent {
  height: number;
  width: number;
}

export const getWindowResize$ = () => {
  const resize$: Observable<IResizeEvent> = fromEvent(window, 'resize').pipe(
    debounce(() => animationEvent$),
    map(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }))
  );

  return resize$;
};
