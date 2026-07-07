# Islamic App (Prayer Times + Qibla + Tasbeeh)

## Features
- Prayer times based on your live location (Aladhan API)
- Qibla direction compass
- Tasbeeh counter (saved on device)
- AdMob Banner ad at the bottom

## Step-by-Step: Upload from Mobile & Build APK (No PC needed)

### Step 1 — Create GitHub Repo
1. Open github.com in your phone browser (or GitHub app)
2. Tap **New Repository**
3. Name it: `islamic-app`
4. Set to **Public**, tap **Create repository**

### Step 2 — Upload the files
Easiest mobile method — use "Create new file" and type the FULL PATH as filename:
1. Tap **Add file → Create new file**
2. In the filename box type: `pubspec.yaml` → paste its content → Commit
3. Repeat for each file below (typing the path auto-creates folders):
   - `lib/main.dart`
   - `lib/services/prayer_service.dart`
   - `lib/screens/prayer_times_screen.dart`
   - `lib/screens/qibla_screen.dart`
   - `lib/screens/tasbeeh_screen.dart`
   - `lib/widgets/ad_banner_widget.dart`
   - `.github/workflows/build.yml`

(Or: download the zip I gave you, then use GitHub's "Add file → Upload files" and drag all extracted files at once if your browser supports folder upload.)

### Step 3 — Let GitHub Actions build the APK
1. After committing all files, go to the **Actions** tab in your repo
2. You'll see "Build APK" workflow running automatically (takes ~5-8 mins)
3. Once green ✅, open it → scroll down to **Artifacts** → download `islamic-app-apk`
4. Unzip it on your phone → you'll get `app-release.apk`

### Step 4 — Install & Test
1. Transfer/download the APK to your phone
2. Enable "Install from unknown sources" if asked
3. Install and test all 3 tabs

## Ads Configured (Real IDs — already fitted in code)
- **App ID:** ca-app-pub-3781293651763401~9646909399 (in `build.yml` manifest step)
- **Banner:** ca-app-pub-3781293651763401/5492041965 — shows at bottom of every screen
- **Interstitial:** ca-app-pub-3781293651763401/7250634740 — shows automatically every 3rd tab switch
- **Rewarded Interstitial:** ca-app-pub-3781293651763401/8142256038 — shows via "Watch Ad for Bonus Count" button on Tasbeeh screen

All real ad units are already wired in — no further AdMob setup needed for this app. Earnings will go straight to your AdMob account once the app is live and getting real traffic.

**Note:** Since this AdMob app is still new, ads may show in limited/test-like mode for the first few days until Google fully verifies it. This is normal.
