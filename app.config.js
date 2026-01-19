export default {
  expo: {
    name: "ebpls-app",
    slug: "ebpls-app",
    scheme: "ebplsapp",
    version: "1.0.0",
    platforms: ["ios", "android"],

    ios: {
      supportsTablet: true,
    },

    android: {
      package: "gov.leyte.ebpls",
      versionCode: 2,  
      usesCleartextTraffic: true,  
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#FFFFFF",
      },
    },

    plugins: [  
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
            networkInspectorEnabled: true
          }
        }
      ]
    ],

    extra: {
      eas: {
        projectId: "dbd132d8-0cce-455f-a62f-08d318f5fa20", 
      },
    },
  },
};