import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_panel.dart';
import '../../widgets/gradient_text.dart';
import '../planner/trip_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _activeTab = 'Dashboard';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.darkBg, Color(0xFF0F0F1A)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              // Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const LuxuryGradientText('Tripify', fontSize: 24),
                          CircleAvatar(
                            backgroundColor: AppTheme.brandGold.withValues(alpha: 0.1),
                            child: const Text('V', style: TextStyle(color: AppTheme.brandGold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Good morning, explorer!',
                        style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                      ),
                      const Text(
                        'Your global command center is ready.',
                        style: TextStyle(color: AppTheme.darkTextMuted, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),

              // Tabs
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: GlassPanel(
                    padding: const EdgeInsets.all(6),
                    borderRadius: 16,
                    child: Row(
                      children: ['Dashboard', 'My Stats', 'Bucket'].map((tab) {
                        final isActive = _activeTab == tab;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _activeTab = tab),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: isActive ? AppTheme.brandGold.withValues(alpha: 0.2) : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  tab,
                                  style: TextStyle(
                                    color: isActive ? AppTheme.brandGold : AppTheme.darkTextMuted,
                                    fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ),

              // Bento Grid
              SliverPadding(
                padding: const EdgeInsets.all(24),
                sliver: SliverMasonryGrid.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  itemBuilder: (context, index) {
                    if (index == 0) return _buildHeroCard();
                    if (index == 1) return _buildStatsCard();
                    if (index == 2) return _buildToolkitCard();
                    return _buildPulseCard();
                  },
                  childCount: 4,
                ),
              ),
              
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroCard() {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => TripDetailScreen(trip: {
            'title': 'Alpine Odyssey',
            'city': 'Switzerland',
            'startDate': 'Oct 12, 2026',
            'itinerary': {
              'days': [
                {
                  'day': 1,
                  'activities': [
                    {'activity': 'Arrival & Zürich Exploration', 'time': '10:00 AM'},
                    {'activity': 'Fondue Dinner', 'time': '07:00 PM'},
                  ]
                }
              ]
            }
          }),
        ),
      ),
      child: GlassPanel(
        padding: const EdgeInsets.all(24),
        color: AppTheme.brandGold.withValues(alpha: 0.15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppTheme.brandGold, borderRadius: BorderRadius.circular(20)),
              child: const Text('UPCOMING', style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 16),
            const Text('Alpine Odyssey', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const Text('12 Days in Switzerland', style: TextStyle(color: AppTheme.darkTextMuted, fontSize: 12)),
            const SizedBox(height: 24),
            const Icon(LucideIcons.users, color: AppTheme.brandGold, size: 20),
          ],
        ),
      ),
    );
  }


  Widget _buildStatsCard() {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('FOOTPRINT', style: TextStyle(color: AppTheme.darkTextMuted, fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          const Text('14', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
          const Text('Cities Explored', style: TextStyle(color: AppTheme.darkTextMuted, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildToolkitCard() {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _toolkitItem(LucideIcons.sparkles, 'AI Planner', AppTheme.brandGold),
          _toolkitItem(LucideIcons.map, 'Real-time Atlas', AppTheme.brandPrimary),
          _toolkitItem(LucideIcons.users, 'Travel Tribes', AppTheme.brandRose),
        ],
      ),
    );
  }

  Widget _toolkitItem(IconData icon, String label, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }

  Widget _buildPulseCard() {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('PULSE', style: TextStyle(color: AppTheme.darkTextMuted, fontSize: 10, fontWeight: FontWeight.bold)),
          SizedBox(height: 12),
          Text('High Volatility in Tokyo Deals!', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}


// Build verification patch on 11/26/2025, 3:18:00 PM

// Build verification patch on 11/28/2025, 12:57:00 PM
