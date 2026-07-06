import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.papertheory.comeback',
  appName: 'comeback',
  webDir: 'dist',
  server: {
    url: 'https://comeback-frontend.vercel.app/',
    cleartext: true
  }
};

export default config;
