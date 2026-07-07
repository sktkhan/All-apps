import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/ad_service.dart';

class TasbeehScreen extends StatefulWidget {
  const TasbeehScreen({super.key});

  @override
  State<TasbeehScreen> createState() => _TasbeehScreenState();
}

class _TasbeehScreenState extends State<TasbeehScreen> {
  int _count = 0;
  static const String _key = 'tasbeeh_count';

  @override
  void initState() {
    super.initState();
    _loadCount();
  }

  Future<void> _loadCount() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _count = prefs.getInt(_key) ?? 0;
    });
  }

  Future<void> _saveCount() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_key, _count);
  }

  void _increment() {
    setState(() => _count++);
    _saveCount();
  }

  void _reset() {
    setState(() => _count = 0);
    _saveCount();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '$_count',
            style: const TextStyle(fontSize: 90, fontWeight: FontWeight.bold, color: Colors.teal),
          ),
          const SizedBox(height: 40),
          GestureDetector(
            onTap: _increment,
            child: Container(
              width: 160,
              height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.teal.shade50,
                border: Border.all(color: Colors.teal, width: 3),
              ),
              child: const Icon(Icons.touch_app, size: 60, color: Colors.teal),
            ),
          ),
          const SizedBox(height: 30),
          TextButton.icon(
            onPressed: _reset,
            icon: const Icon(Icons.refresh),
            label: const Text('Reset'),
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber),
            onPressed: () {
              AdService.instance.showRewarded(
                onReward: (amount) {
                  setState(() => _count += 10);
                  _saveCount();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Bonus +10 count added!')),
                  );
                },
              );
            },
            icon: const Icon(Icons.play_circle),
            label: const Text('Watch Ad for Bonus Count'),
          ),
        ],
      ),
    );
  }
}
