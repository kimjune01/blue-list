# Blue List 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

![Screenshot](https://github.com/kimjune01/blue-list/assets/6355623/93818cc6-fd81-4a71-9b8e-5f7121ad7d3e)

It shows a list of named bluetooth peripherals nearby, with a button to start/stop scanning.

## Get started with development

1. Install dependencies

   ```bash
   npm install
   ```

2. Prebuild the app

   ```bash
    npx expo prebuild
   ```

3. Build & run from Xcode while expo is running
- Make sure that your device is connected to the development machine
- You'll need a developer account to run it on a physical device
- Select your team in Xcode, otherwise you'll get an error.
   ```bash
    npx expo start
   ```
## Exporting & Shipping

Follow instructions on Expo's [build docs](https://docs.expo.dev/build/setup/)

## Internal Release (iOS)

1. Add UUID to the provisioning profile 
2. `eas build` for the `.ipa` file
3. Download to iOS device

Alternatively, deploy to Testflight
