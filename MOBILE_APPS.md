# iOS & Android — build and submission runbook

This app ships to both stores via [Capacitor](https://capacitorjs.com/),
which wraps the same static web app (`index.html`/`app.js`/etc. — also
served on GitHub Pages) in a native shell. The native projects live in
`android/` and `ios/App/`; the web assets they load are synced in from the
repo root by `npm run sync-web` (see `scripts/sync-web.js`) rather than
duplicated — there's one source of truth for the app itself.

Two CI workflows build both platforms on every push:
[`android-build.yml`](.github/workflows/android-build.yml) and
[`ios-build.yml`](.github/workflows/ios-build.yml). As committed, they
produce an **unsigned debug/simulator build** — proof the native projects
compile — because a real, store-submittable build needs *your own* Apple
and Google developer credentials, which obviously aren't and can't be
baked into this repo. Everything below is what to add to unlock a real
signed build, and then what each store actually wants from there.

## Prerequisites

| | Cost | What you need |
|---|---|---|
| Apple | $99/yr | Apple Developer Program membership, **a Mac** |
| Google | $25 one-time | Google Play Console account |

There's no way around the Mac for iOS — Apple's signing toolchain only
runs on macOS. The CI workflow uses GitHub's hosted macOS runners so you
don't need one for *building*, but you'll still want one to run Xcode
locally at least once (to sign into your Apple ID, accept licenses, sanity
-check the app on the Simulator before submitting).

## Before you submit anywhere: pick a real bundle ID

`capacitor.config.ts` currently sets `appId: 'com.cajungamers13.tcgtradingpost'`
— a placeholder. Change it to whatever reverse-DNS ID you actually want to
own (`com.yourdomain.appname` if you have a domain, otherwise
`com.yourname.appname` is fine) **before** you create the app record in
App Store Connect or Play Console — once a store has a build under an
appId, changing it means starting the app record over. After changing it,
run `npx cap sync` to propagate it into both native projects.

## Android

### Option A — build locally (simplest for a one-off)

1. Install [Android Studio](https://developer.android.com/studio).
2. `npm install && npm run sync-web && npx cap open android` — opens the
   project in Android Studio.
3. Build → Generate Signed Bundle/APK, create a new keystore (Android
   Studio walks you through it — **back the keystore file up somewhere
   safe**, losing it means you can never update the app again under the
   same listing), pick **Android App Bundle**.
4. That produces `app-release.aab`.

### Option B — let CI build it

1. Generate a keystore once, locally:
   ```
   keytool -genkeypair -v -keystore release.keystore -alias tcgtradingpost \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. In the repo's GitHub Settings → Secrets and variables → Actions:
   - Secret `ANDROID_KEYSTORE_BASE64` — `base64 -i release.keystore | pbcopy` (or `base64 -w0 release.keystore` on Linux), paste the output
   - Secret `ANDROID_KEYSTORE_PASSWORD` — the keystore password
   - Secret `ANDROID_KEY_ALIAS` — `tcgtradingpost` (or whatever alias you used)
   - Secret `ANDROID_KEY_PASSWORD` — the key password
   - Variable `ANDROID_HAS_SIGNING` — `true`
3. Push anything, or re-run the workflow manually — the release AAB
   appears as a downloadable artifact on that run.

### Play Console

1. Create the app in [Play Console](https://play.google.com/console) ($25 one-time registration if this is your first app).
2. Upload the `.aab` under Production (or Internal/Closed testing first).
3. **New developer accounts must run a closed test with 20+ testers for
   14 days before Google allows a production release** — plan for that
   lead time if this is a new account.
4. Fill in the store listing: screenshots (see below), short/full
   description, a privacy policy URL (see below), content rating
   questionnaire, and the Data Safety form.
5. Google's review is typically much faster than Apple's — often hours,
   not days.

## iOS

### Option A — build locally (simplest for a one-off)

1. On a Mac: `npm install && npm run sync-web && npx cap open ios` — opens
   `App.xcworkspace`/`App.xcodeproj` in Xcode.
2. Xcode → Signing & Capabilities → sign in with your Apple ID, let Xcode
   manage signing automatically (easiest for a first submission).
3. Product → Archive, then use the Organizer window's **Distribute App**
   flow to upload straight to App Store Connect.

### Option B — let CI build it

This is more moving parts than Android's equivalent (Apple's signing model
needs a distribution certificate *and* a provisioning profile, not just a
keystore) — reach for this once you're doing this repeatedly, not for a
first submission:

1. In Xcode or the [Apple Developer portal](https://developer.apple.com/account),
   create an **Apple Distribution** certificate and export it as a `.p12`
   (set a password on export).
2. Create an **App Store** provisioning profile for the `appId` you chose
   above, download the `.mobileprovision` file.
3. In the repo's GitHub Settings → Secrets and variables → Actions:
   - Secret `IOS_CERTIFICATE_BASE64` — `base64 -i Certificate.p12 | pbcopy`
   - Secret `IOS_CERTIFICATE_PASSWORD` — the password you set on export
   - Secret `IOS_PROVISION_PROFILE_BASE64` — `base64 -i Profile.mobileprovision | pbcopy`
   - Secret `IOS_KEYCHAIN_PASSWORD` — any password; it's just for the
     temporary CI keychain
   - Variable `IOS_TEAM_ID` — your 10-character Apple Developer Team ID
     (Apple Developer portal → Membership)
   - Variable `IOS_HAS_SIGNING` — `true`
4. Push anything — the signed `.ipa` appears as a downloadable artifact.
   Upload it to App Store Connect with
   [Transporter](https://apps.apple.com/app/transporter/id1450874784) or
   `xcrun altool --upload-app`.

### App Store Connect

1. Create the app record in [App Store Connect](https://appstoreconnect.apple.com).
2. Upload a build (from either option above); it needs to finish Apple's
   automated processing (10–60 min) before you can submit it.
3. **Guideline 4.2 (Minimum Functionality) risk**: a bare wrapper around a
   website is a common rejection reason. This app already clears the main
   bar honestly — it's a real installed app with its own icon/splash, and
   works fully offline via the service worker (no wifi at a convention
   table is a genuine, real use case, not a pretext). Mention that
   explicitly in the App Review notes so the reviewer doesn't have to
   guess why it's not "just a Safari bookmark."
4. Fill in the listing: screenshots (see below), description, a privacy
   policy URL (see below), age rating, and the App Privacy "nutrition
   label" questionnaire.
5. Submit for review — typically 24–48h, budget for at least one
   rejection round on a first submission.

## Screenshots (both stores)

Neither store lets you submit without them, and they have to come from
the actual running app — a Simulator/emulator screenshot or a real device
photo, not a mockup. This is the one piece that has to happen on your own
Mac/Android Studio, since this sandbox can't run an iOS Simulator (no
Mac) or an Android emulator (needs the Android SDK, blocked here the same
way the Gradle build is — see the commit history). Once you have the app
running in Android Studio's emulator or Xcode's Simulator, each platform's
standard screenshot tool (⌘S in the Simulator, the emulator's camera
icon) captures at the exact sizes each store wants.

## Privacy policy

Both stores require a URL to one, even though the honest answer here is
simple: this app makes no account, has no backend, and sends nothing
anywhere except the two things it fetches directly from your device: the
optional Pokémon TCG API card-image lookups and the Google Fonts webfonts
— both third-party requests you can see in the app's own source, not data
collection. Say the word if you'd like this turned into an actual
published privacy-policy page (as a GitHub Pages page or an Artifact) —
takes a few minutes and both store forms just need a URL to point at.
