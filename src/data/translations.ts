export interface AppTranslations {
  appName: string;
  searchPlaceholder: string;
  allCategories: string;
  latestReleases: string;
  trendingOnCampus: string;
  topDownloadedApps: string;
  popularCategories: string;
  categoriesSubtitle: string;
  aboutApp: string;
  developer: string;
  version: string;
  downloads: string;
  rating: string;
  size: string;
  apkFile: string;
  verifySecure: string;
  publishedOn: string;
  lastUpdated: string;
  targetRuntime: string;
  screenshots: string;
  relatedApps: string;
  noAppsFound: string;
  writeReview: string;
  submitReview: string;
  userName: string;
  comment: string;
  starRating: string;
  downloadApk: string;
  downloading: string;
  downloadComplete: string;
  backToStore: string;
  playConsole: string;
  factoryReset: string;
  pwaInstall: string;
  pwaInstallMobile: string;
  cancel: string;
  reviewPlaceholder: string;
  ratingAverage: string;
  reviewsCount: string;
  activeInstalls: string;
  apkPayload: string;
  yourNameLabel: string;
  reviewCommentLabel: string;
  successReview: string;
  viewAll: string;
  unregisteredSw: string;
  resetSuccessful: string;
  resetMessage: string;
  resetButton: string;
  resetConfirmTitle: string;
  resetConfirmBody: string;
  loadingDetails: string;
  appNotFound: string;
  appNotFoundDesc: string;
}

export const TRANSLATIONS: Record<'en' | 'ta', AppTranslations> = {
  en: {
    appName: "UMN App Store",
    searchPlaceholder: "Search apps, developers, or categories...",
    allCategories: "All Categories",
    latestReleases: "Latest Releases",
    trendingOnCampus: "Trending on Campus",
    topDownloadedApps: "Top Downloaded Apps",
    popularCategories: "Popular Categories",
    categoriesSubtitle: "The most popular utility and entertainment resources on campus",
    aboutApp: "About this application",
    developer: "Developer",
    version: "Version",
    downloads: "Downloads",
    rating: "Rating",
    size: "Size",
    apkFile: "APK File",
    verifySecure: "Verified Secure Link",
    publishedOn: "Published On",
    lastUpdated: "Last Updated",
    targetRuntime: "Target Runtime",
    screenshots: "Application Screenshots",
    relatedApps: "Related Category Apps",
    noAppsFound: "No applications matched your search or selection",
    writeReview: "Write a Reflection / Review",
    submitReview: "Submit Review",
    userName: "Your Name",
    comment: "Your Review Comment",
    starRating: "Star Rating",
    downloadApk: "Download APK",
    downloading: "Downloading APK... {progress}%",
    downloadComplete: "APK Downloaded! Click to view installation guide",
    backToStore: "Back to Store",
    playConsole: "Play Console",
    factoryReset: "Factory Master Reset",
    pwaInstall: "Install App Store (PWA)",
    pwaInstallMobile: "Install App",
    cancel: "Cancel",
    reviewPlaceholder: "Share your reflections or experience with this app...",
    ratingAverage: "Rating",
    reviewsCount: "reviews",
    activeInstalls: "active installs",
    apkPayload: "APK payload",
    yourNameLabel: "Name / Congregation",
    reviewCommentLabel: "Review / Reflection",
    successReview: "Review submitted successfully! Thank you for your reflection.",
    viewAll: "View all",
    unregisteredSw: "Unregistered active service worker during reset",
    resetSuccessful: "Reset Successful",
    resetMessage: "Play store reset successfully! The app is reloading automatically from the beginning.",
    resetButton: "Factory Reset Now",
    resetConfirmTitle: "Reset Play Store?",
    resetConfirmBody: "Are you sure you want to completely factory reset? This will wipe all local descriptions, APK databases, and browser Service Workers back to fresh defaults.",
    loadingDetails: "Loading application details...",
    appNotFound: "Application Not Found",
    appNotFoundDesc: "The application with the specified identifier could not be retrieved. It may have been draft-saved, suspended, or deleted."
  },
  ta: {
    appName: "உமன்ஸ் பிளே ஸ்டோர்",
    searchPlaceholder: "செயலிகள், உருவாக்குநர்கள் அல்லது பிரிவுகளைத் தேடுக...",
    allCategories: "அனைத்து பிரிவுகளும்",
    latestReleases: "புதிய வெளியீடுகள்",
    trendingOnCampus: "வளாகத்தில் பிரபலமானவை",
    topDownloadedApps: "அதிகம் பதிவிறக்கம் செய்யப்பட்ட செயலிகள்",
    popularCategories: "பிரபலமான பிரிவுகள்",
    categoriesSubtitle: "வளாகத்தில் மிகவும் பிரபலமான பயன்பாடு மற்றும் பொழுதுபோக்கு ஆதாரங்கள்",
    aboutApp: "இந்த செயலியைப் பற்றி",
    developer: "உருவாக்குநர்",
    version: "பதிப்பு",
    downloads: "பதிவிறக்கங்கள்",
    rating: "மதிப்பீடு",
    size: "அளவு",
    apkFile: "APK கோப்பு",
    verifySecure: "பாதுகாப்பான இணைப்பு சரிபார்க்கப்பட்டது",
    publishedOn: "வெளியிடப்பட்ட தேதி",
    lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது",
    targetRuntime: "ஆண்ட்ராய்டு இயக்க முறைமை",
    screenshots: "செயலியின் திரைக்காட்சிகள்",
    relatedApps: "தொடர்புடைய செயலிகள்",
    noAppsFound: "உங்கள் தேடலுக்கு எந்த செயலிகளும் கிடைக்கவில்லை",
    writeReview: "உங்கள் கருத்து அல்லது பதிவை எழுதுங்கள்",
    submitReview: "கருத்தைச் சமர்ப்பி",
    userName: "உங்கள் பெயர்",
    comment: "உங்கள் கருத்து",
    starRating: "நட்சத்திர மதிப்பீடு",
    downloadApk: "APK கோப்பைப் பதிவிறக்கு",
    downloading: "APK பதிவிறக்கம் செய்யப்படுகிறது... {progress}%",
    downloadComplete: "APK பதிவிறக்கம் செய்யப்பட்டது! நிறுவல் வழிகாட்டியைப் பார்க்கவும்",
    backToStore: "முகப்புப் பக்கத்திற்குத் திரும்பு",
    playConsole: "பிளே கன்சோல்",
    factoryReset: "முழுமையான தொழிற்சாலை மீட்டமைப்பு",
    pwaInstall: "செயலியை நிறுவு (PWA)",
    pwaInstallMobile: "நிறுவு",
    cancel: "ரத்துசெய்",
    reviewPlaceholder: "இந்த செயலி பற்றிய உங்கள் கருத்து அல்லது அனுபவத்தைப் பகிரவும்...",
    ratingAverage: "மதிப்பீடு",
    reviewsCount: "மதிப்புரைகள்",
    activeInstalls: "பதிவிறக்கங்கள்",
    apkPayload: "APK கோப்பின் அளவு",
    yourNameLabel: "பெயர் / சபை",
    reviewCommentLabel: "மதிப்புரை / கருத்துரை",
    successReview: "கருத்து வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது! உங்கள் பகிர்வுக்கு நன்றி.",
    viewAll: "அனைத்தையும் காட்டு",
    unregisteredSw: "மீட்டமைப்பின் போது செயலில் உள்ள சேவை பணியாளர் நீக்கப்பட்டது",
    resetSuccessful: "மீட்டமைக்கப்பட்டது",
    resetMessage: "ஆப் ஸ்டோர் வெற்றிகரமாக மீட்டமைக்கப்பட்டது! புதிய மாற்றங்களைப் பெற பக்கம் தானாகவே புதுப்பிக்கப்படுகிறது.",
    resetButton: "முதலிலிருந்து மீட்டமை",
    resetConfirmTitle: "ஆப் ஸ்டோரை மீட்டமைக்கலாமா?",
    resetConfirmBody: "நிச்சயமாக ஆப் ஸ்டோரை மீட்டமைக்க வேண்டுமா? நீங்கள் உருவாக்கிய அனைத்து தனிப்பயன் மாற்றங்களும் அழிக்கப்பட்டு, அசல் அமைப்புகளுடன் உலாவி தற்காலிக சேமிப்புகளும் முழுமையாக அழிக்கப்படும்.",
    loadingDetails: "விவரங்கள் ஏற்றப்படுகின்றன...",
    appNotFound: "செயலி கிடைக்கவில்லை",
    appNotFoundDesc: "குறிப்பிட்ட அடையாளத்தைக் கொண்ட செயலியைப் பெற முடியவில்லை. அது வரைவாகச் சேமிக்கப்பட்டிருக்கலாம், இடைநிறுத்தப்பட்டிருக்கலாம் அல்லது நீக்கப்பட்டிருக்கலாம்."
  }
};
