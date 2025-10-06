import { MatomoInitializerService } from 'ngx-matomo-client';
import { environment } from 'src/environments/environment';

export function appConfigFactory(matomoInitializer: MatomoInitializerService) {
  return () => {
    const siteId = environment.MATOMO_SITE_ID;
    const trackerUrl = environment.MATOMO_TRACKER_URL;

    if (siteId && trackerUrl) {
      matomoInitializer.initializeTracker({
        siteId,
        trackerUrl
      });
    }
  };
}
