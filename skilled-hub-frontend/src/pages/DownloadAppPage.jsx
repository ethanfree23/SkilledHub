import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../components/LegalPageLayout';
import { FaAndroid, FaApple } from 'react-icons/fa';

export const ANDROID_APK_PATH = '/downloads/techflash-android.apk';

const DownloadAppPage = () => {
  return (
    <LegalPageLayout title="Download the TechFlash app" updatedAt="May 5, 2026">
      <section className="space-y-4">
        <p>
          Install TechFlash on your phone: use the Android package below, or add the site to your home screen on iPhone
          (Apple does not allow installing arbitrary IPA files from a website for general users).
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <FaAndroid className="h-10 w-10 text-[#FE6711]" aria-hidden />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Android (.apk)</h2>
            <p className="text-sm text-gray-600">Download and open the file, then allow installs when prompted.</p>
          </div>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Download{' '}
            <a
              href={ANDROID_APK_PATH}
              className="font-semibold text-[#FE6711] underline hover:text-[#e55a0a]"
              download
            >
              techflash-android.apk
            </a>{' '}
            from this site.
          </li>
          <li>
            On your phone, open <span className="font-semibold">Settings → Apps → Special access → Install unknown apps</span>{' '}
            (wording varies by manufacturer) and allow your browser or Files app to install APKs.
          </li>
          <li>Open the downloaded file and tap <span className="font-semibold">Install</span>.</li>
        </ol>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-3">
          <FaApple className="h-10 w-10 text-gray-700" aria-hidden />
          <div>
            <h2 className="text-xl font-bold text-gray-900">iPhone and iPad</h2>
            <p className="text-sm text-gray-600">
              Use Safari: tap Share, then <span className="font-semibold">Add to Home Screen</span>. A downloadable install
              package for iOS requires the App Store or Apple Business / Enterprise distribution.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          You can still use the full site at{' '}
          <Link to="/" className="font-semibold text-[#FE6711] underline hover:text-[#e55a0a]">
            techflash.app
          </Link>{' '}
          in Safari—bookmark or add to home screen for quick access.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default DownloadAppPage;
