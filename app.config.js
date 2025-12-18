export default ({ config, eas }) => {
  const profile = eas?.profile ?? "production";

  // Logic to determine the bundle identifier (Package Name)
  const androidPackage =
    profile === "development"
      ? "com.deadsign.lifeplanner.dev"
      : profile === "preview"
      ? "com.deadsign.lifeplanner.preview"
      : profile === "production-apk"
      ? "com.deadsign.lifeplanner.apk" // Unique ID for the APK build
      : "com.deadsign.lifeplanner";

  // Logic to determine the App Name on the home screen
  const appName =
    profile === "development"
      ? "LifePlanner Dev"
      : profile === "preview"
      ? "LifePlanner Preview"
      : profile === "production-apk"
      ? "LifePlanner APK" // Distinct name for the APK build
      : "LifePlanner";

  return {
    ...config,
    expo: {
      ...config.expo,
      name: appName,
      slug: "deadsign",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "deadsign",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,

      ios: {
        supportsTablet: true,
      },

      android: {
        package: androidPackage,
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        permissions: [
          "POST_NOTIFICATIONS",
          "SCHEDULE_EXACT_ALARM",
          "USE_EXACT_ALARM",
        ],
      },

      web: {
        output: "static",
        favicon: "./assets/images/favicon.png",
      },

      plugins: [
        "expo-router",
        [
          "expo-build-properties",
          {
            android: {
              // enableProguardInReleaseBuilds: true,
              // enableShrinkResourcesInReleaseBuilds: true,
              useLegacyPackaging: true,
            },
            ios: {
              deploymentTarget: "15.1",
            },
          },
        ],
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#181818",
          },
        ],
      ],

      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },

      extra: {
        eas: {
          projectId: "1849e9fb-489d-4feb-b174-76bc385ffb7d",
        },
      },
    },
  };
};