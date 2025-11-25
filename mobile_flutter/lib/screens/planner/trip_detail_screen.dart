import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_panel.dart';

class TripDetailScreen extends StatefulWidget {
  final Map<String, dynamic> trip;
  const TripDetailScreen({super.key, required this.trip});

  @override
  State<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends State<TripDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final trip = widget.trip;
    
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F0F1A), Color(0xFF05050A)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(24),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            trip['title'] ?? 'Trip to ${trip['city']}',
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '${trip['city']} · ${trip['days'] ?? 'TBD'} Days',
                            style: const TextStyle(color: AppTheme.darkTextMuted, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    const Icon(LucideIcons.share2, color: AppTheme.brandGold),
                  ],
                ),
              ),

              // Tab Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: GlassPanel(
                  borderRadius: 16,
                  padding: const EdgeInsets.all(4),
                  child: TabBar(
                    controller: _tabController,
                    indicator: BoxDecoration(
                      color: AppTheme.brandGold.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    labelColor: AppTheme.brandGold,
                    unselectedLabelColor: AppTheme.darkTextMuted,
                    labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    tabs: const [
                      Tab(text: 'PLAN'),
                      Tab(text: 'ATLAS'),
                      Tab(text: 'DEBT'),
                      Tab(text: 'TEAM'),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Tab Content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildItineraryTab(),
                    _buildAtlasTab(),
                    _buildExpensesTab(),
                    _buildMembersTab(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildItineraryTab() {
    final itinerary = widget.trip['itinerary'] as List? ?? [];
    
    if (itinerary.isEmpty) {
      return const Center(child: Text("Itinerary is still being curated...", style: TextStyle(color: AppTheme.darkTextMuted)));
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: itinerary.length,
      itemBuilder: (context, i) {
        final day = itinerary[i];
        final activities = day['activities'] as List? ?? [];
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("DAY ${i + 1}", style: const TextStyle(color: AppTheme.brandGold, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1.5)),
            const SizedBox(height: 12),
            ...activities.map((act) => Container(
              margin: const EdgeInsets.only(bottom: 16),
              child: GlassPanel(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(LucideIcons.checkCircle2, color: Colors.greenAccent, size: 16),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(act['activity'] ?? 'Activity', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(act['time'] ?? 'TBD', style: const TextStyle(color: AppTheme.darkTextMuted, fontSize: 11)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            )).toList(),
            const SizedBox(height: 24),
          ],
        );
      },
    );
  }

  Widget _buildAtlasTab() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.map, size: 64, color: Colors.white24),
          SizedBox(height: 16),
          Text('Collaborative Atlas Initializing...', style: TextStyle(color: AppTheme.darkTextMuted)),
        ],
      ),
    );
  }

  Widget _buildExpensesTab() {
    return const Center(child: Text('Settlement Logic Syncing...', style: TextStyle(color: AppTheme.darkTextMuted)));
  }

  Widget _buildMembersTab() {
    return const Center(child: Text('Team Management Linking...', style: TextStyle(color: AppTheme.darkTextMuted)));
  }
}


// Build verification patch on 11/25/2025, 1:09:00 PM
