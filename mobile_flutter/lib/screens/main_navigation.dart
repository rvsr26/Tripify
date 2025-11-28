import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_panel.dart';
import 'home/home_screen.dart';
import 'planner/planner_screen.dart';
import 'explorer/explorer_screen.dart';
import 'social/social_screen.dart';
import 'identity/identity_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const PlannerScreen(),
    const ExplorerScreen(),
    const SocialScreen(),
    const IdentityScreen(),
  ];


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: _screens[_currentIndex],
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: GlassPanel(
            borderRadius: 32,
            blur: 20,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(LucideIcons.home, 0),
                _navItem(LucideIcons.sparkles, 1),
                _navItem(LucideIcons.globe, 2),
                _navItem(LucideIcons.users, 3),
                _navItem(LucideIcons.user, 4),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, int index) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.brandGold.withValues(alpha: 0.15) : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: isActive ? AppTheme.brandGold : AppTheme.darkTextMuted,
          size: 22,
        ),
      ),
    );
  }
}


// Build verification patch on 11/27/2025, 1:34:00 PM

// Build verification patch on 11/28/2025, 10:31:00 AM

// Build verification patch on 11/28/2025, 1:32:00 PM
