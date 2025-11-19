import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../widgets/glass_panel.dart';
import '../../../theme/app_theme.dart';

class MembersTab extends StatelessWidget {
  final dynamic trip;
  final String currentUserId;

  const MembersTab({super.key, required this.trip, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    final members = trip['members'] as List? ?? [];
    final isAdmin = trip['admin'] == currentUserId || (trip['admin'] is Map && trip['admin']['_id'] == currentUserId);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Trip Members", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              if (isAdmin)
                ElevatedButton.icon(
                  onPressed: () {}, // Invite Logic
                  icon: const Icon(LucideIcons.plus, size: 14),
                  label: const Text("INVITE"),
                ),
            ],
          ),
          const SizedBox(height: 24),
          ...members.map((m) => _buildMemberItem(m, isAdmin)),
        ],
      ),
    );
  }

  Widget _buildMemberItem(dynamic m, bool isAdmin) {
    final user = m['userId'];
    final name = user is Map ? user['name'] : "Traveler";
    final username = user is Map ? user['username'] : "explorer";
    final role = m['role'] ?? "member";

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
                color: AppTheme.creamGold.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(name[0].toUpperCase(), style: TextStyle(color: AppTheme.creamGold, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text("@$username", style: const TextStyle(fontSize: 11, color: Colors.white38)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: role == 'admin' ? Colors.orangeAccent.withValues(alpha: 0.1) : Colors.blueAccent.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                role.toUpperCase(),
                style: TextStyle(
                  fontSize: 9, 
                  fontWeight: FontWeight.bold, 
                  color: role == 'admin' ? Colors.orangeAccent : Colors.blueAccent
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
