import { useEffect } from 'react';

export function useInterval(callback, delay, condition) {
  useEffect(() => {
    if (condition && !condition()) {
      return () => undefined;
    }
    function tick() {
      callback();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [callback, delay, condition]);
}
