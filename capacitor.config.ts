import type { CapacitorConfig } from '@capacitor/cli';

// appId is a placeholder reverse-DNS identifier tied to the cajungamers13
// GitHub account — change it before you register this app in App Store
// Connect / Play Console if you'd rather use your own domain or company
// name. Once you've submitted a build under an appId, it's effectively
// permanent for that app record on both stores, so lock this in first.
const config: CapacitorConfig = {
  appId: 'com.cajungamers13.tcgtradingpost',
  appName: 'TCG Trading Post',
  webDir: 'www',
  backgroundColor: '#100f0d',
  ios: {
    contentInset: 'always',
    backgroundColor: '#100f0d'
  },
  android: {
    backgroundColor: '#100f0d'
  }
};

export default config;
