import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../../services/planner_service.dart';
import '../../../theme/app_theme.dart';
import '../../../widgets/glass_panel.dart';
import '../../../widgets/gradient_text.dart';
import '../planner/trip_detail_screen.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  List<dynamic> allTrips = [];
  List<dynamic> curatedPlans = [];
  Map<String, dynamic>? stats;
  List<dynamic> communities = [];
  bool _loading = true;
  int _currentTripIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  Future<void> _loadAllData() async {
    try {
      final results = await Future.wait([
        PlannerService.getMyTrips(),
        ApiService.getStats(),
        ApiService.getCommunities(),
        rootBundle.loadString('assets/data/curated_plans.json'),
      ]);
      if (mounted) {
        setState(() {
          allTrips = results[0] as List;
          stats = (results[1] as Map<String, dynamic>)['stats'];
          communities = results[2] as List;
          curatedPlans = jsonDecode(results[3] as String);
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    final user = Provider.of<AuthProvider>(context).user;
    final name = user?['name']?.split(' ')[0] ?? 'Explorer';

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 10),
          _buildGreeting(name),
          const SizedBox(height: 30),
          _buildHeroCarousel(),
          const SizedBox(height: 24),
          _buildStatsAndFeatures(),
          const SizedBox(height: 32),
          const Text("ELITE CURATED JOURNEYS", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: AppTheme.brandRose)),
          const SizedBox(height: 16),
          _buildCuratedGrid(),
          const SizedBox(height: 32),
          _buildPulseSection(),
          const SizedBox(height: 100), // Space for bottom nav
        ],
      ),
    );
  }

  Widget _buildGreeting(String name) {
    final hour = DateTime.now().hour;
    String greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    if (hour >= 17) greeting = "Good evening";

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              "$greeting, ",
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.normal),
            ),
            GradientText(
              "$name!",
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900),
              gradient: const LinearGradient(colors: [AppTheme.brandGoldLight, Colors.white]),
            ),
          ],
        ),
        const SizedBox(height: 8),
        const Text(
          "Your global command center is ready. Where to next?",
          style: TextStyle(color: Colors.white54, fontSize: 14),
        ),
      ],
    );
  }

  Widget _buildHeroCarousel() {
    if (allTrips.isEmpty) {
      return _buildEmptyState();
    }

    return Column(
      children: [
        SizedBox(
          height: 200,
          child: PageView.builder(
            onPageChanged: (idx) => setState(() => _currentTripIndex = idx),
            itemCount: allTrips.length,
            itemBuilder: (context, idx) {
              final trip = allTrips[idx];
              return _buildTripHeroCard(trip, idx == 0);
            },
          ),
        ),
        if (allTrips.length > 1) ...[
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: allTrips.asMap().entries.map((entry) {
              return Container(
                width: 8.0,
                height: 8.0,
                margin: const EdgeInsets.symmetric(horizontal: 4.0),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(_currentTripIndex == entry.key ? 0.9 : 0.2),
                ),
              );
            }).toList(),
          ),
        ]
      ],
    );
  }

  Widget _buildTripHeroCard(dynamic trip, bool isUpcoming) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => TripDetailScreen(trip: trip)),
      ),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        child: GlassPanel(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.brandGoldLight.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      isUpcoming ? "UPCOMING" : "ADVENTURE",
                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.brandGoldLight),
                    ),
                  ),
                  Text("📍 ${trip['city']}", style: const TextStyle(fontSize: 12, color: Colors.white54)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    trip['title'],
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Your ${trip['days']}-day odyssey is ready.",
                    style: const TextStyle(fontSize: 12, color: Colors.white54),
                  ),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => TripDetailScreen(trip: trip)),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                      minimumSize: const Size(100, 32),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text("CONTINUE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                  Row(
                    children: [
                      const Icon(LucideIcons.users, size: 14, color: Colors.white24),
                      const SizedBox(width: 6),
                      Text(
                        "${(trip['members'] as List?)?.length ?? 1} members",
                        style: const TextStyle(fontSize: 11, color: Colors.white24),
                      ),
                    ],
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return GlassPanel(
      padding: const EdgeInsets.all(40),
      child: Center(
        child: Column(
          children: [
            const Text("🌍", style: TextStyle(fontSize: 40)),
            const SizedBox(height: 16),
            const Text("World Awaits", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              "Start your first AI journey now.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white54),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {}, // Redirect to planner
              child: const Text("INITIALIZE AI"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsAndFeatures() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildBentoStat("TRIPS", stats?['totalTrips']?.toString() ?? "0"),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildBentoStat("BADGES", stats?['unlockedBadges']?.toString() ?? "0"),
            ),
          ],
        ),
        const SizedBox(height: 12),
        _buildFeatureHub(),
      ],
    );
  }

  Widget _buildBentoStat(String label, String value) {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 9, color: Colors.white38, letterSpacing: 1.1)),
        ],
      ),
    );
  }

  Widget _buildFeatureHub() {
    final features = [
      {'icon': '✨', 'label': 'AI Planner'},
      {'icon': '🎮', 'label': 'Social'},
      {'icon': '📍', 'label': 'Map'},
      {'icon': '🏘️', 'label': 'Tribes'},
      {'icon': '🗺️', 'label': 'Bucket'},
    ];

    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("TOOLKIT", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.white24)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: features.map((f) => _buildFeatureIcon(f['icon']!, f['label']!)).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureIcon(String icon, String label) {
    return Column(
      children: [
        Container(
          width: 45,
          height: 45,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(15),
          ),
          alignment: Alignment.center,
          child: Text(icon, style: const TextStyle(fontSize: 20)),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 9, color: Colors.white54)),
      ],
    );
  }

  Widget _buildPulseSection() {
    if (communities.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("YOUR PULSE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.white24)),
        const SizedBox(height: 16),
        ...communities.take(3).map((c) => _buildPulseItem(c)),
      ],
    );
  }

  Widget _buildPulseItem(dynamic c) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassPanel(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.blueAccent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Text(c['icon'] ?? '🏘️'),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(c['name'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  Text("${c['members']?.length ?? 0} active members", style: const TextStyle(fontSize: 11, color: Colors.white38)),
                ],
              ),
            ),
            Icon(LucideIcons.chevronRight, size: 16, color: Colors.white24),
          ],
        ),
      ),
    );
  }

  Widget _buildCuratedGrid() {
    if (curatedPlans.isEmpty) return const SizedBox.shrink();
    
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.8,
      ),
      itemCount: curatedPlans.take(4).length,
      itemBuilder: (context, i) {
        final plan = curatedPlans[i];
        return GlassPanel(
          padding: EdgeInsets.zero,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    image: DecorationImage(image: NetworkImage(plan['image'] ?? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'), fit: BoxFit.cover),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(plan['city']?.toString().toUpperCase() ?? 'DESTINATION', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.brandGold)),
                    const SizedBox(height: 2),
                    Text(plan['title'] ?? 'Adventure await', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              )
            ],
          ),
        );
      },
    );
  }
}

