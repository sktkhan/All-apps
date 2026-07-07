import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'screens/prayer_times_screen.dart';
import 'screens/qibla_screen.dart';
import 'screens/tasbeeh_screen.dart';
import 'widgets/ad_banner_widget.dart';
import 'services/ad_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await MobileAds.instance.initialize();
  AdService.instance.loadInterstitial();
  AdService.instance.loadRewarded();
  runApp(const IslamicApp());
}

class IslamicApp extends StatelessWidget {
  const IslamicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Islamic App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.teal,
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    PrayerTimesScreen(),
    QiblaScreen(),
    TasbeehScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Islamic App'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(child: _screens[_selectedIndex]),
          const AdBannerWidget(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
          AdService.instance.maybeShowInterstitialOnTabSwitch();
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.access_time),
            label: 'Prayer Times',
          ),
          NavigationDestination(
            icon: Icon(Icons.explore),
            label: 'Qibla',
          ),
          NavigationDestination(
            icon: Icon(Icons.fingerprint),
            label: 'Tasbeeh',
          ),
        ],
      ),
    );
  }
}
