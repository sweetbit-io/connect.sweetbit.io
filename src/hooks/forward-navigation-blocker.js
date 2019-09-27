import { useEffect } from 'react';

export function useForwardNavigationBlocker(history) {
  useEffect(() => {
    const stack = [undefined];

    return history.block((location, action) => {
      if (action === 'PUSH') {
        stack.push(location.key);
      } else if (action === 'POP') {
        const previous = stack[stack.length - 2];
        if (previous === location.key) {
          stack.pop();
        } else {
          return 'block';
        }
      }
    });
  }, [history]);
}
