import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../widgets/glass_panel.dart';

class ReviewsTab extends StatelessWidget {
  final dynamic trip;

  const ReviewsTab({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("⭐ Top Attractions", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          _buildAttractionCard(
            "Eiffel Tower",
            "4.8",
            "The iconic iron lattice tower on the Champ de Mars.",
            "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
          ),
          _buildAttractionCard(
            "Louvre Museum",
            "4.7",
            "The world's largest art museum and a historic monument.",
            "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
          ),
        ],
      ),
    );
  }

  Widget _buildAttractionCard(String title, String rating, String desc, String image) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: GlassPanel(
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 150,
              width: double.infinity,
              decoration: BoxDecoration(
                image: DecorationImage(image: NetworkImage(image), fit: BoxFit.cover),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.amber.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text("★ $rating", style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(desc, style: const TextStyle(fontSize: 12, color: Colors.white54)),
                  const SizedBox(height: 16),
                  const Row(
                    children: [
                      Text("Explore Experience", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blueAccent)),
                      SizedBox(width: 4),
                      Icon(LucideIcons.arrowRight, size: 12, color: Colors.blueAccent),
                    ],
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
