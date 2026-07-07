import 'package:flutter/material.dart';
import '../services/prayer_service.dart';

class PrayerTimesScreen extends StatefulWidget {
  const PrayerTimesScreen({super.key});

  @override
  State<PrayerTimesScreen> createState() => _PrayerTimesScreenState();
}

class _PrayerTimesScreenState extends State<PrayerTimesScreen> {
  PrayerTimings? _timings;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final position = await PrayerService.getCurrentLocation();
      final timings = await PrayerService.getPrayerTimes(
        position.latitude,
        position.longitude,
      );
      setState(() {
        _timings = timings;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Widget _timeRow(String name, String time, IconData icon) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: ListTile(
        leading: Icon(icon, color: Colors.teal),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
        trailing: Text(time, style: const TextStyle(fontSize: 16)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_error!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _load,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    final t = _timings!;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.only(top: 12),
        children: [
          Center(
            child: Text(
              t.date,
              style: const TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ),
          const SizedBox(height: 8),
          _timeRow('Fajr', t.fajr, Icons.wb_twilight),
          _timeRow('Dhuhr', t.dhuhr, Icons.wb_sunny),
          _timeRow('Asr', t.asr, Icons.wb_cloudy),
          _timeRow('Maghrib', t.maghrib, Icons.nightlight_round),
          _timeRow('Isha', t.isha, Icons.dark_mode),
        ],
      ),
    );
  }
}
