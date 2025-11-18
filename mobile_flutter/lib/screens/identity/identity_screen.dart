import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_panel.dart';
import '../../widgets/elite_member_card.dart';

class IdentityScreen extends StatefulWidget {
  const IdentityScreen({super.key});

  @override
  State<IdentityScreen> createState() => _IdentityScreenState();
}

class _IdentityScreenState extends State<IdentityScreen> {
  // Mock data to match what the user Sees if not logged in or default
  final Map<String, dynamic> profile = {
    'name': 'Valeriy R.',
    'username': 'valeriy_explorer',
    'bio': 'Passionate adventurer exploring the intersection of culture, art, and nature. Always seeking the next hidden gem.',
    'tripCount': 128,
    'friendCount': 42,
    'travelROI': {
      'culturalDepth': 85,
      'sustainabilityScore': 92,
    }
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                // Gradient banner
                Container(
                  height: 140,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppTheme.brandGold, AppTheme.brandRose],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      stops: [0.0, 1.0],
                    ),
                  ),
                  child: Opacity(
                    opacity: 0.1,
                    child: Image.network(
                      'https://www.transparenttextures.com/patterns/cubes.png',
                      repeat: ImageRepeat.repeat,
                    ),
                  ),
                ),
                
                // Avatar
                Positioned(
                  top: 90,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppTheme.brandGold.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF0F0F1A), width: 4),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      profile['name'][0].toUpperCase(),
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.brandGold),
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 60),

            // Name & Username
            Text(
              profile['name'],
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
            ),
            Text(
              '@${profile['username']}',
              style: const TextStyle(color: AppTheme.darkTextMuted, fontSize: 16),
            ),
            
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text(
                    profile['bio'],
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: Colors.white70, height: 1.6),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Elite Member Card
                  EliteMemberCard(user: profile),
                  
                  const SizedBox(height: 32),
                  
                  // Stats Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildProfileStat(profile['tripCount'].toString(), "Trips"),
                      _buildProfileStat(profile['travelROI']['culturalDepth'].toString(), "Culture Score", icon: LucideIcons.landmark, iconColor: AppTheme.brandGold),
                      _buildProfileStat(profile['travelROI']['sustainabilityScore'].toString(), "Eco-Score", icon: LucideIcons.leaf, iconColor: Colors.greenAccent),
                      _buildProfileStat(profile['friendCount'].toString(), "Friends"),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      side: const BorderSide(color: Colors.white10),
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                    ),
                    child: const Text("Edit Profile"),
                  ),
                  
                  const SizedBox(height: 48),
                  
                  // Adventures Section
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Adventures", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text("Recent trips by @${profile['username']}.", style: const TextStyle(color: Colors.white38, fontSize: 13)),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Coming Soon Empty State
                  GlassPanel(
                    padding: const EdgeInsets.symmetric(vertical: 60),
                    child: Center(
                      child: Column(
                        children: [
                          const Text("✈️", style: TextStyle(fontSize: 40)),
                          const SizedBox(height: 16),
                          const Text("Coming soon", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Text(
                            "@${profile['username']}'s shared itineraries will appear here.",
                            style: const TextStyle(color: Colors.white24, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 60),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileStat(String value, String label, {IconData? icon, Color? iconColor}) {
    return Column(
      children: [
        if (icon != null) ...[
          Icon(icon, size: 20, color: iconColor),
          const SizedBox(height: 8),
        ],
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

