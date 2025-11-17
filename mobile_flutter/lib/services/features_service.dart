import 'dart:convert';
import 'api_service.dart';

class FeaturesService {
  // Bucket List
  static Future<List<dynamic>> getBucketList() async {
    final res = await ApiService.get('/features/bucket-list');
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return data['bucketList'] ?? [];
    }
    return [];
  }

  static Future<void> addBucketItem(Map<String, dynamic> data) async {
    await ApiService.post('/features/bucket-list', data);
  }

  // Stories
  static Future<List<dynamic>> getStories() async {
    final res = await ApiService.get('/features/stories');
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return data['stories'] ?? [];
    }
    return [];
  }

  // Weather
  static Future<Map<String, dynamic>> getWeather(String city) async {
    final res = await ApiService.get('/features/weather?city=$city');
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception('Failed to get weather');
  }

  // Stats
  static Future<Map<String, dynamic>> getStats() async {
    final res = await ApiService.get('/features/stats');
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    return {};
  }
}
