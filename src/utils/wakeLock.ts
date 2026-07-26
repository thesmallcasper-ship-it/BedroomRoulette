type ScreenWakeLockSentinel = EventTarget & {
  released: boolean;
  release: () => Promise<void>;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<ScreenWakeLockSentinel>;
  };
};

let screenWakeLock: ScreenWakeLockSentinel | null = null;

export async function requestScreenWakeLock() {
  const wakeLock = (navigator as WakeLockNavigator).wakeLock;
  if (!wakeLock || document.visibilityState !== 'visible') {
    return;
  }

  if (screenWakeLock && !screenWakeLock.released) {
    return;
  }

  try {
    const lock = await wakeLock.request('screen');
    screenWakeLock = lock;
    lock.addEventListener('release', () => {
      if (screenWakeLock === lock) {
        screenWakeLock = null;
      }
    });
  } catch {
    screenWakeLock = null;
  }
}

export function releaseScreenWakeLock() {
  if (!screenWakeLock || screenWakeLock.released) {
    screenWakeLock = null;
    return;
  }

  void screenWakeLock.release();
  screenWakeLock = null;
}
