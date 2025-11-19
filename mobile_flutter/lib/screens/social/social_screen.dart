import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_panel.dart';

class SocialScreen extends StatefulWidget {
  const SocialScreen({super.key});

  @override
  State<SocialScreen> createState() => _SocialScreenState();
}

class _SocialScreenState extends State<SocialScreen> with SingleTickerProviderStateMixin {
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
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Travel Pulse', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text('Join the conversation in your favorite tribes.', style: TextStyle(fontSize: 12, color: AppTheme.darkTextMuted)),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              dividerColor: Colors.transparent,
              indicatorColor: AppTheme.brandGold,
              labelColor: AppTheme.brandGold,
              unselectedLabelColor: Colors.white38,
              tabAlignment: TabAlignment.start,
              labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              tabs: const [
                Tab(text: "Community Feed"),
                Tab(text: "Trip Templates"),
                Tab(text: "Live Map"),
                Tab(text: "Local Experts"),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCommunityFeed(),
          _buildTripTemplates(),
          _buildLiveMap(),
          _buildLocalExperts(),
        ],
      ),
    );
  }

  Widget _buildCommunityFeed() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          _buildStoriesReel(),
          const SizedBox(height: 32),
          _buildFeedItem(
            name: "Alex Hunter",
            username: "alex_h",
            content: "Finally arrived in beautiful Tuscany! AI did a great job picking this spot.",
            time: "2 hours ago",
            likes: 24,
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
          ),
          _buildFeedItem(
            name: "Sarah Jenkins",
            username: "sarah_j",
            content: "The Swiss Alps are breathtaking. Our 'Alpine Luxury' itinerary is flawless so far.",
            time: "5 hours ago",
            likes: 156,
            image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80",
          ),
        ],
      ),
    );
  }

  Widget _buildStoriesReel() {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 6,
        itemBuilder: (context, i) => Container(
          margin: const EdgeInsets.only(right: 20),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.brandGold, width: 2),
                ),
                child: const CircleAvatar(radius: 30, backgroundImage: NetworkImage('https://i.pravatar.cc/150')),
              ),
              const SizedBox(height: 8),
              const Text("User", style: TextStyle(fontSize: 10, color: Colors.white54)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeedItem({required String name, required String username, required String content, required String time, required int likes, required String image}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: GlassPanel(
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const CircleAvatar(radius: 16, backgroundColor: AppTheme.brandGold),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Text("@$username", style: const TextStyle(fontSize: 11, color: Colors.white38)),
                    ],
                  ),
                ],
              ),
            ),
            Image.network(image, height: 200, width: double.infinity, fit: BoxFit.cover),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(content, style: const TextStyle(fontSize: 13, height: 1.5)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(LucideIcons.heart, size: 16, color: AppTheme.brandRose),
                      const SizedBox(width: 6),
                      Text(likes.toString(), style: const TextStyle(fontSize: 12, color: Colors.white54)),
                      const Spacer(),
                      Text(time, style: const TextStyle(fontSize: 10, color: Colors.white24)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTripTemplates() {
    return _buildEmptyState(LucideIcons.layout, "No templates found", "No trip templates match your search.");
  }

  Widget _buildLiveMap() {
    return _buildEmptyState(LucideIcons.map, "Map unavailable", "Connect your account to view live explorer locations.");
  }

  Widget _buildLocalExperts() {
    return _buildEmptyState(LucideIcons.graduationCap, "Local Experts", "Our premium guides are currently on expeditions.");
  }

  Widget _buildEmptyState(IconData icon, String title, String desc) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: Colors.white10),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(desc, style: const TextStyle(color: Colors.white24, fontSize: 12)),
        ],
      ),
    );
  }
}

