# Terraforming Titans — Android Mobile Build

This document covers the full setup and workflow for building and running the Android version via Capacitor. The existing Electron/Steam workflow is not affected.

---

## Prerequisites

### 1. Java (JDK 17+)
```bash
java -version
```
Already available as OpenJDK 21 on the dev machine.

### 2. Android SDK (command-line tools)

Download and install Android command-line tools:
```bash
mkdir -p ~/Android/cmdline-tools
cd ~/Android/cmdline-tools
wget "https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip" -O cmdline-tools.zip
unzip cmdline-tools.zip
mv cmdline-tools latest
rm cmdline-tools.zip
```

Add to `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Android
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

Then reload: `source ~/.bashrc`

Install required SDK packages:
```bash
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
```

### 3. Android Emulator (if no physical device)

Install the emulator and a system image (~8GB, ensure enough free disk space):
```bash
sdkmanager "emulator" "system-images;android-35;google_apis;x86_64"
```

Add the emulator to `PATH` in `~/.bashrc`:
```bash
export PATH=$PATH:$ANDROID_HOME/emulator
```

Create a virtual device (Pixel 6 profile):
```bash
avdmanager create avd -n TT_test -k "system-images;android-35;google_apis;x86_64" --device "pixel_6"
```

Start the emulator:
```bash
emulator -avd TT_test -no-snapshot-load &
```

Wait until it's fully booted before running `mobile:dev`:
```bash
adb wait-for-device shell 'until getprop sys.boot_completed | grep -q "1"; do sleep 3; done && echo ready'
```

### 4. Node.js + npm
Already present. Run `node --version` to confirm.

---

## First-Time Project Setup

These steps have already been done on the `mobile-android` branch. Listed here for reference if setting up on a new machine.

```bash
npm install
npx cap add android   # generates the android/ project (git-ignored)
```

---

## Dev Workflow (livereload)

Connect an Android device via USB with USB debugging enabled, or start an emulator, then:

```bash
npm run mobile:dev
```

This starts a local HTTP server and opens the game on the device with live reload. No file copying needed — edit any JS/CSS and the device refreshes automatically.

### First run checklist
- Device has USB debugging enabled (Settings → Developer Options)
- Device is authorized (`adb devices` shows it as `authorized`)
- Or an AVD emulator is running (`avdmanager` / Android Studio)

---

## Release Build

Produces a signed APK / AAB for distribution:

```bash
npm run mobile:release
```

This runs three steps in sequence:
1. `node scripts/mobile-build.js` — copies `index.html`, `src/`, `assets/`, `vendor/` into `www/`
2. `cap sync android` — copies `www/` into the Android project
3. `cap build android` — compiles the APK

Output: `android/app/build/outputs/apk/` (debug) or `android/app/build/outputs/bundle/` (AAB for Play Store)

### Signing for release
For Play Store submission, a keystore is required. Generate once:
```bash
keytool -genkeypair -v -keystore terraforming-titans.keystore -alias tt -keyalg RSA -keysize 2048 -validity 10000
```
Keep the keystore file private — never commit it.

---

## What Goes in Git

| Path | In git? |
|---|---|
| `capacitor.config.json` | Yes |
| `scripts/mobile-build.js` | Yes |
| `doc/` | Yes |
| `android/` | No (generated) |
| `www/` | No (generated at release time) |
| `node_modules/` | No |

---

## Architecture Notes

- **Capacitor** wraps the existing `index.html` in an Android WebView — zero changes to game logic
- **`www/`** is only created during `mobile:release`, never during dev
- **`localStorage`** works as-is in Android WebView — save data is compatible
- **Electron** (`electron:dev`, Steam build) is completely unaffected
- iOS builds require macOS + Xcode — deferred for now
