import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_panel.dart';
import '../../services/planner_service.dart';

class ExplorerScreen extends StatefulWidget {
  const ExplorerScreen({super.key});

  @override
  State<ExplorerScreen> createState() => _ExplorerScreenState();
}

class _ExplorerScreenState extends State<ExplorerScreen> {
  List<dynamic> myTrips = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final trips = await PlannerService.getMyTrips();
      if (mounted) {
        setState(() {
          myTrips = trips;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Global Trip Explorer', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            Text('Discover your journeys across the digital globe.', style: TextStyle(fontSize: 12, color: AppTheme.darkTextMuted)),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Weather Card (Retained from mobile hub but synced title)
            const Text('LIVE DESTINATION DATA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: AppTheme.brandGold)),
            const SizedBox(height: 16),
            _buildWeatherCard(),
            
            const SizedBox(height: 32),
            
            // My Trips Section (from Web Sidebar)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('MY TRIPS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: AppTheme.brandGold)),
                Text(
                  '${myTrips.length} trip${myTrips.length != 1 ? 's' : ''}',
                  style: const TextStyle(fontSize: 10, color: Colors.white24, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (myTrips.isEmpty)
              _buildEmptyState()
            else
              ...myTrips.map((trip) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildTripCard(trip),
              )),
              
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildWeatherCard() {
    return GlassPanel(
      padding: const EdgeInsets.all(24),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('TOKYO, JP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              Text('Partly Cloudy', style: TextStyle(color: AppTheme.darkTextMuted)),
            ],
          ),
          Row(
            children: [
              Icon(LucideIcons.cloudSun, color: AppTheme.brandGold, size: 32),
              SizedBox(width: 12),
              Text('24°C', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -2)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTripCard(dynamic trip) {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppTheme.brandGold.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: const Text('📍', style: TextStyle(fontSize: 24)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(trip['title'] ?? 'Adventure', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text(
                  "${trip['city']} · ${trip['days']} days",
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                ),
              ],
            ),
          ),
          const Icon(LucideIcons.chevronRight, size: 16, color: Colors.white24),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return GlassPanel(
      padding: const EdgeInsets.all(40),
      child: Center(
        child: Column(
          children: [
            const Text("✈️", style: TextStyle(fontSize: 40)),
            const SizedBox(height: 16),
            const Text("No trips yet", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              "Start your first journey to see it on the map.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white24, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

