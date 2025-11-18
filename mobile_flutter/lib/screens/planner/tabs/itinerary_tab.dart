import 'package:flutter/material.dart';
import '../../../widgets/glass_panel.dart';
import '../../../theme/app_theme.dart';

class ItineraryTab extends StatefulWidget {
  final dynamic trip;

  const ItineraryTab({super.key, required this.trip});

  @override
  State<ItineraryTab> createState() => _ItineraryTabState();
}

class _ItineraryTabState extends State<ItineraryTab> {
  int _selectedDayIndex = 0;

  @override
  Widget build(BuildContext context) {
    final itinerary = widget.trip['itinerary'];
    final days = (itinerary is Map ? itinerary['days'] : (itinerary is List ? itinerary : [])) as List;

    if (days.isEmpty) {
      return const Center(child: Text("No itinerary found.", style: TextStyle(color: Colors.white24)));
    }

    return Column(
      children: [
        const SizedBox(height: 20),
        _buildDaySelector(days),
        const SizedBox(height: 24),
        Expanded(child: _buildActivityList(days[_selectedDayIndex])),
      ],
    );
  }

  Widget _buildDaySelector(List days) {
    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: days.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedDayIndex == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedDayIndex = index),
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              width: 60,
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.creamGold : Colors.white10,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "DAY",
                    style: TextStyle(
                      fontSize: 8, 
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.black : Colors.white54,
                    ),
                  ),
                  Text(
                    "${index + 1}",
                    style: TextStyle(
                      fontSize: 18, 
                      fontWeight: FontWeight.w900,
                      color: isSelected ? Colors.black : Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildActivityList(dynamic day) {
    final activities = (day is Map ? day['activities'] : []) as List;
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: activities.length,
      itemBuilder: (context, index) {
        final act = activities[index];
        return _buildActivityItem(act, index == activities.length - 1);
      },
    );
  }

  Widget _buildActivityItem(dynamic act, bool isLast) {
    return IntrinsicHeight(
      child: Row(
        children: [
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: AppTheme.creamGold,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: AppTheme.creamGold.withValues(alpha: 0.5), blurRadius: 10),
                  ],
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppTheme.creamGold.withValues(alpha: 0.2),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Container(
              padding: const EdgeInsets.only(bottom: 24),
              child: GlassPanel(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          act['time'] ?? 'All Day',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.creamGold),
                        ),
                        const Icon(Icons.more_horiz, size: 16, color: Colors.white24),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      act['activity'] ?? 'Unknown Activity',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    if (act['location'] != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        act['location'],
                        style: const TextStyle(fontSize: 12, color: Colors.white38),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
