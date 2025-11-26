import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_panel.dart';
import '../../services/planner_service.dart';

class PlannerScreen extends StatefulWidget {
  const PlannerScreen({super.key});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  final _promptController = TextEditingController();
  int _step = 1; // 1: Prompt, 2: Options, 3: Loading
  bool _isLoading = false;
  Map<String, dynamic>? _options;

  final Map<String, Map<String, dynamic>> _optionConfigs = {
    'optionA': {'badge': '🌿 Budget', 'color': Colors.greenAccent},
    'optionB': {'badge': '👔 Executive', 'color': AppTheme.brandGoldLight},
    'optionC': {'badge': '💎 Prestige', 'color': AppTheme.brandGold},
  };

  void _handleGenerate() async {
    if (_promptController.text.trim().length < 5) return;
    
    setState(() => _isLoading = true);
    try {
      final res = await PlannerService.generateOptions(_promptController.text);
      setState(() {
        _options = res;
        _step = 2;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _handleSelect(String key, Map<String, dynamic> data) async {
    setState(() {
      _step = 3;
      _isLoading = true;
    });
    try {
      await PlannerService.selectPlan(
        optionKey: key,
        optionData: data,
        parsedData: _options!,
        naturalPrompt: _promptController.text,
      );
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Plan synthesized! View it in My Adventures.')));
      }
    } catch (e) {
      setState(() {
        _step = 2;
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: _step > 1 ? IconButton(onPressed: () => setState(() => _step = 1), icon: const Icon(Icons.arrow_back, color: Colors.white)) : null,
        title: const Text('AI Trip Planner', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: _step == 3 
              ? _buildLoadingStep()
              : _step == 1 ? _buildPromptStep() : _buildOptionsStep(),
        ),
      ),
    );
  }

  Widget _buildLoadingStep() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: AppTheme.brandGold),
          const SizedBox(height: 32),
          const Text(
            'Gemini is building your itinerary...',
            textAlign: TextAlign.center,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 12),
          const Text(
            'Crafting a custom map, packing list, and day-by-day plan. This takes about 10 seconds.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white38, fontSize: 13, height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _buildPromptStep() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'AI Trip Planner',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -1),
          ),
          const SizedBox(height: 8),
          const Text(
            'Describe your dream trip and let Gemini create the perfect itinerary.',
            style: TextStyle(color: AppTheme.darkTextMuted, fontSize: 15),
          ),
          const SizedBox(height: 48),
          const Text(
            "What's your dream trip? 🌍",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          GlassPanel(
            child: TextField(
              controller: _promptController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'e.g. Plan a 10-day trip to Japan for \$5000, focusing on anime, street food, and nature...',
                hintStyle: TextStyle(color: Colors.white12),
                border: InputBorder.none,
                contentPadding: EdgeInsets.all(20),
              ),
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _isLoading ? null : _handleGenerate,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.brandGold,
              minimumSize: const Size.fromHeight(60),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: _isLoading 
              ? const CircularProgressIndicator(color: Colors.black)
              : const Text('✨ Generate Trip Options', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _buildOptionsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Visions of ${_options?['destination']}',
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 24),
        Expanded(
          child: ListView(
            children: ['optionA', 'optionB', 'optionC'].map((key) {
              final data = _options![key];
              final config = _optionConfigs[key]!;
              return _buildOptionCard(key, data, config);
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildOptionCard(String key, dynamic data, Map<String, dynamic> config) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: GlassPanel(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: (config['color'] as Color).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
              child: Text(config['badge'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: config['color'])),
            ),
            const SizedBox(height: 16),
            Text(data['name'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(data['tagline'], style: const TextStyle(color: Colors.white54, fontSize: 13)),
            const SizedBox(height: 20),
            const Text("Estimated Cost", style: TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.bold)),
            Text("${_options?['currency']}${data['estimatedCost']}", style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => _handleSelect(key, data),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.brandGold,
                minimumSize: const Size.fromHeight(50),
              ),
              child: Text("Choose ${config['badge'].split(' ')[1]}", style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }
}



// Build verification patch on 11/24/2025, 12:13:00 PM

// Build verification patch on 11/26/2025, 10:18:00 AM
