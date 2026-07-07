import 'package:google_mobile_ads/google_mobile_ads.dart';

// Real Ad Unit IDs (Noor Prayer Times & Qibla app)
const String kInterstitialAdUnitId = 'ca-app-pub-3781293651763401/7250634740';
const String kRewardedInterstitialAdUnitId =
    'ca-app-pub-3781293651763401/8142256038';

class AdService {
  AdService._internal();
  static final AdService instance = AdService._internal();

  InterstitialAd? _interstitialAd;
  RewardedInterstitialAd? _rewardedAd;

  int _tabSwitchCount = 0;

  // ---------------- Interstitial ----------------

  void loadInterstitial() {
    InterstitialAd.load(
      adUnitId: kInterstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _interstitialAd!.fullScreenContentCallback =
              FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _interstitialAd = null;
              loadInterstitial(); // preload the next one
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              _interstitialAd = null;
            },
          );
        },
        onAdFailedToLoad: (error) {
          _interstitialAd = null;
        },
      ),
    );
  }

  // Call this every time the user switches tabs.
  // Shows an interstitial after every 3rd switch (keeps UX reasonable).
  void maybeShowInterstitialOnTabSwitch() {
    _tabSwitchCount++;
    if (_tabSwitchCount % 3 == 0 && _interstitialAd != null) {
      _interstitialAd!.show();
    }
  }

  // ---------------- Rewarded Interstitial ----------------

  void loadRewarded() {
    RewardedInterstitialAd.load(
      adUnitId: kRewardedInterstitialAdUnitId,
      request: const AdRequest(),
      rewardedInterstitialAdLoadCallback: RewardedInterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _rewardedAd = null;
              loadRewarded(); // preload the next one
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              _rewardedAd = null;
            },
          );
        },
        onAdFailedToLoad: (error) {
          _rewardedAd = null;
        },
      ),
    );
  }

  bool get isRewardedReady => _rewardedAd != null;

  void showRewarded({required Function(int amount) onReward}) {
    if (_rewardedAd == null) return;
    _rewardedAd!.show(
      onUserEarnedReward: (ad, reward) {
        onReward(reward.amount.toInt());
      },
    );
  }
}
