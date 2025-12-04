export default ({ config, eas }) => {
  const profile = eas?.profile ?? "production";

  const androidPackage =
    profile === "development"
      ? "com.deadsign.lifeplanner.dev"
      : profile === "preview"
      ? "com.deadsign.lifeplanner.preview"
      : "com.deadsign.lifeplanner";

  return {
    ...config,
    expo: {
      ...config.expo,
      name:
        profile === "development"
          ? "LifePlanner Dev"
          : profile === "preview"
          ? "LifePlanner Preview"
          : "LifePlanner",
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
