import 'dart:convert';
import 'api_service.dart';

class PlannerService {
  static Future<Map<String, dynamic>> generateOptions(String prompt) async {
    final res = await ApiService.post('/planner/options', {'prompt': prompt});
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception('Failed to generate options: ${res.body}');
  }

  static Future<Map<String, dynamic>> selectPlan({
    required String optionKey,
    required Map<String, dynamic> optionData,
    required Map<String, dynamic> parsedData,
    required String naturalPrompt,
  }) async {
    final res = await ApiService.post('/planner/select', {
      'optionKey': optionKey,
      'optionData': optionData,
      'parsedData': parsedData,
      'naturalPrompt': naturalPrompt,
    });
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception('Failed to select plan');
  }

  static Future<List<dynamic>> getMyTrips() async {
    final res = await ApiService.get('/planner');
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return data['trips'] ?? [];
    }
    return [];
  }
}
