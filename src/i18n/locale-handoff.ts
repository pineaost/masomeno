'use client';

// A route segment remounts when its language changes. Keep its draft in this tab's memory.
export function createLocaleHandoff<T>() {
  let pending: { destination: string; value: T } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function clear(destination: string) {
    if (pending?.destination !== destination) return;
    pending = undefined;
    clearTimeout(timer);
  }

  return {
    prepare(destination: string, value: T) {
      clearTimeout(timer);
      pending = { destination, value };
      timer = setTimeout(() => clear(destination), 30_000);
    },
    read(destination: string) {
      return pending?.destination === destination ? pending.value : undefined;
    },
    clear,
  };
}
