import 'package:flutter/material.dart';
import '../../../widgets/glass_panel.dart';

class MapTab extends StatelessWidget {
  final dynamic trip;

  const MapTab({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Expanded(
            child: GlassPanel(
              padding: EdgeInsets.zero,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Placeholder for Google Maps
                  Container(
                    color: Colors.white.withValues(alpha: 0.05),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text("📍", style: TextStyle(fontSize: 40)),
                          const SizedBox(height: 16),
                          Text(
                            "Interactive Map of ${trip['city']}",
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const Text(
                            "Google Maps Integration Pending Native Keys",
                            style: TextStyle(fontSize: 10, color: Colors.white24),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
