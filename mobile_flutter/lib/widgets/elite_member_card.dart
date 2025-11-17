import 'package:flutter/material.dart';

class EliteMemberCard extends StatelessWidget {
  final dynamic user;

  const EliteMemberCard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(1),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: [
            Colors.amber.withValues(alpha: 0.5),
            Colors.amber.withValues(alpha: 0.1),
            Colors.white.withValues(alpha: 0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(23),
          color: const Color(0xFF0F172A), // Dark blue-black for elite feel
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "TRIPIFY ELITE",
                      style: TextStyle(
                        fontSize: 10, 
                        fontWeight: FontWeight.bold, 
                        letterSpacing: 2, 
                        color: Colors.amber
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user['name']?.toUpperCase() ?? "MEMBER",
                      style: const TextStyle(
                        fontSize: 18, 
                        fontWeight: FontWeight.w900, 
                        letterSpacing: 1
                      ),
                    ),
                  ],
                ),
                const Icon(Icons.star, color: Colors.amber, size: 28),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCardInfo("MEMBER SINCE", "2024"),
                _buildCardInfo("LOYALTY STATUS", "GOLD"),
                _buildCardInfo("TIER", "LEGACY"),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCardInfo(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 8, color: Colors.white38, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ],
    );
  }
}
