import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../widgets/glass_panel.dart';

class JournalTab extends StatelessWidget {
  final dynamic trip;

  const JournalTab({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Travel Journal", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(LucideIcons.camera, size: 14),
                label: const Text("ADD PHOTO"),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildJournalEntry(
            "First Day in Paris",
            "The lights at night are even more beautiful than I imagined. Exploring the small cafes near the Seine was the highlight of my day.",
            "happy",
          ),
          _buildJournalEntry(
            "Art and History",
            "Spent 4 hours in the Louvre today. Seeing the Mona Lisa in person was surreal, though the crowds were quite large.",
            "amazed",
          ),
        ],
      ),
    );
  }

  Widget _buildJournalEntry(String title, String content, String mood) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: GlassPanel(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const Text("😊", style: TextStyle(fontSize: 20)),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              content,
              style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.5),
            ),
            const SizedBox(height: 16),
            const Row(
              children: [
                Icon(LucideIcons.clock, size: 12, color: Colors.white24),
                SizedBox(width: 6),
                Text("2 hours ago", style: TextStyle(fontSize: 10, color: Colors.white24)),
              ],
            )
          ],
        ),
      ),
    );
  }
}
