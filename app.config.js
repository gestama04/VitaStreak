export default {
  expo: {
    name: 'VitaStreak',
    slug: 'vitastreak',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'vitastreak',
    userInterfaceStyle: 'automatic',

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gestama.vitastreak',
    },

    android: {
      versionCode: 8,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#0f172a',
      },
      package: 'com.gestama.vitastreak',
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/icon.png',
    },

    plugins: [
      'expo-router',
      "expo-font",
      "@react-native-community/datetimepicker",
      "expo-sharing",
      "expo-status-bar",
      [
        'expo-splash-screen',
        {
          image: './assets/images/vitastreak-FUNDO.png',
          backgroundColor: '#010c24',
          imageWidth: 250,
          resizeMode: 'contain',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#7c3aed',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: '36.0.0',
          },
        },
      ],
      [
  'react-native-android-widget',
  {
    widgets: [
      {
        name: 'VitaStreakDashboard',
        label: 'VitaStreak',
        description: 'Streak e progresso diário',
        minWidth: '250dp',
        minHeight: '110dp',
        targetCellWidth: 4,
        targetCellHeight: 2,
        resizeMode: 'horizontal|vertical',
        previewImage: './assets/images/icon.png',
        updatePeriodMillis: 1800000,
      },
    ],
  },
],
      'expo-web-browser',
      'expo-asset',
      'expo-localization',

    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '42ade82a-b853-4ab2-b4e9-4c1a08bd7a91',
      },
    },
  },
}