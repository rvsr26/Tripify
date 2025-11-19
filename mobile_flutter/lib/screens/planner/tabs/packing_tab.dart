import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../services/api_service.dart';
import '../../../widgets/glass_panel.dart';

class PackingTab extends StatefulWidget {
  final dynamic trip;
  final Function(dynamic) onUpdate;

  const PackingTab({super.key, required this.trip, required this.onUpdate});

  @override
  State<PackingTab> createState() => _PackingTabState();
}

class _PackingTabState extends State<PackingTab> {
  bool _generating = false;

  Future<void> _generatePacking() async {
    setState(() => _generating = true);
    try {
      final res = await ApiService.post('/planner/${widget.trip['_id']}/packing', {});
      if (res.statusCode == 200) {
        // Handle update via onUpdate
      }
    } catch (e) {
      // Error
    }
    setState(() => _generating = false);
  }

  @override
  Widget build(BuildContext context) {
    final packing = widget.trip['packingList'];
    final categories = packing?['categories'] as List? ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("🎒 Packing List", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              if (categories.isEmpty)
                ElevatedButton(
                  onPressed: _generating ? null : _generatePacking,
                  child: Text(_generating ? "GENERATING..." : "AI GENERATE"),
                ),
            ],
          ),
          const SizedBox(height: 24),
          if (categories.isEmpty) _buildEmptyState(),
          ...categories.map((cat) => _buildCategory(cat)),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 40),
          const Text("No items yet.", style: TextStyle(color: Colors.white54)),
          const SizedBox(height: 8),
          const Text("Use the AI generator to build your custom list.", style: TextStyle(fontSize: 12, color: Colors.white24)),
        ],
      ),
    );
  }

  Widget _buildCategory(dynamic cat) {
    final items = cat['items'] as List? ?? [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            children: [
              Text(cat['icon'] ?? '📦', style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Text(
                cat['name']?.toUpperCase() ?? "CATEGORY",
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Colors.white70),
              ),
            ],
          ),
        ),
        ...items.map((item) => _buildItem(item)),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildItem(String item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: GlassPanel(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            const Icon(LucideIcons.circle, size: 16, color: Colors.white24),
            const SizedBox(width: 14),
            Text(item, style: const TextStyle(fontSize: 14)),
          ],
        ),
      ),
    );
  }
}
