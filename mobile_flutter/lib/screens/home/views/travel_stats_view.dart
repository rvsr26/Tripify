import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../services/api_service.dart';
import '../../../theme/app_theme.dart';
import '../../../widgets/glass_panel.dart';

class TravelStatsView extends StatefulWidget {
  const TravelStatsView({super.key});

  @override
  State<TravelStatsView> createState() => _TravelStatsViewState();
}

class _TravelStatsViewState extends State<TravelStatsView> {
  Map<String, dynamic>? stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    final res = await ApiService.getStats();
    if (mounted) {
      setState(() {
        stats = res['stats'];
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (stats == null) return const Center(child: Text("Failed to load analytics"));

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeroStats(),
          const SizedBox(height: 24),
          _buildFinancialCard(),
          const SizedBox(height: 24),
          const Text(
            "Recent Achievements",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          _buildBadgesGrid(),
        ],
      ),
    );
  }

  Widget _buildHeroStats() {
    return Row(
      children: [
        Expanded(child: _buildStatItem("Trips", stats!['totalTrips'].toString(), Colors.blueAccent)),
        const SizedBox(width: 12),
        Expanded(child: _buildStatItem("Cities", stats!['totalCities'].toString(), Colors.pinkAccent)),
        const SizedBox(width: 12),
        Expanded(child: _buildStatItem("Days", stats!['totalDays'].toString(), Colors.greenAccent)),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return GlassPanel(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: color),
          ),
          const SizedBox(height: 4),
          Text(
            label.toUpperCase(),
            style: const TextStyle(fontSize: 10, letterSpacing: 1.2, color: Colors.white54),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialCard() {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.banknote, color: AppTheme.brandGoldLight, size: 20),
              const SizedBox(width: 10),
              const Text("Financial Overview", style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(height: 32, color: Colors.white10),
          _buildFinancialRow("Total Budget", "\$${stats!['totalBudget']}"),
          const SizedBox(height: 12),
          _buildFinancialRow("Total Spent", "\$${stats!['totalSpent']}"),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.greenAccent.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Money Saved", style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
                Text("\$${stats!['moneySaved']}", style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.w900)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildBadgesGrid() {
    final badges = stats!['badges'] as List? ?? [];
    if (badges.isEmpty) return const Text("No badges earned yet.", style: TextStyle(color: Colors.white54));

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.8,
      ),
      itemCount: badges.length,
      itemBuilder: (context, index) {
        final b = badges[index];
        return GlassPanel(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(b['icon'] ?? '🏆', style: const TextStyle(fontSize: 40)),
              const SizedBox(height: 12),
              Text(
                b['name'],
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                b['desc'],
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 10, color: Colors.white54),
              ),
            ],
          ),
        );
      },
    );
  }
}
