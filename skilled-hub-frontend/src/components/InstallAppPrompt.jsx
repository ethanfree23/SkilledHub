import React, { useCallback, useEffect, useState } from 'react';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIOSDevice() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [standalone] = useState(() => isStandalone());
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setIos(isIOSDevice());

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (standalone || dismissed) return null;

  const showChrome = !!deferredPrompt;
  const showIOSHelp = ios && !showChrome;

  if (!showChrome && !showIOSHelp) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="rounded-2xl border border-orange-200 bg-white/95 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-gray-800">Use TechFlash like an app</p>
          {showChrome && (
            <p className="mt-1 text-sm text-gray-600">
              Install for quick access from your home screen. Works offline for basic navigation after you&apos;ve
              opened the site once.
            </p>
          )}
          {showIOSHelp && (
            <p className="mt-1 text-sm text-gray-600">
              Tap the Share button, then <span className="font-semibold">Add to Home Screen</span> to install
              TechFlash on your iPhone or iPad.
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {showChrome && (
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-xl bg-[#FE6711] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e55a0a]"
            >
              Install app
            </button>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
