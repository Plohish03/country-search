export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): (...args: A) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return (...args: A) => {
    if (timerId != undefined) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => fn(...args), delay);
  };
}
