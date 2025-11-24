import 'package:flutter/material.dart';
import '../../../widgets/glass_panel.dart';

class BucketListView extends StatelessWidget {
  const BucketListView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const SizedBox(height: 40),
          const Text("🗺️", style: TextStyle(fontSize: 60)),
          const SizedBox(height: 24),
          const Text(
            "Your Quest Begins",
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Text(
            "Track your dream destinations and the adventures you've yet to conquer.",
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white54),
          ),
          const SizedBox(height: 40),
          _buildItem("Tokyo Cherry Blossoms", "Spring 2026"),
          _buildItem("Northern Lights in Iceland", "Winter 2026"),
          _buildItem("Santorini Sunsets", "Summer 2027"),
        ],
      ),
    );
  }

  Widget _buildItem(String title, String timeframe) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassPanel(
        padding: const EdgeInsets.all(20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(timeframe, style: const TextStyle(fontSize: 12, color: Colors.white38)),
              ],
            ),
            const Icon(Icons.check_box_outline_blank, color: Colors.white24),
          ],
        ),
      ),
    );
  }
}

// Build verification patch on 11/24/2025, 10:55:00 AM
