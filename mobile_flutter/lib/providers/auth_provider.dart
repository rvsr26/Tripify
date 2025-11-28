import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  bool _isLoading = true;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  Map<String, dynamic>? _userData;
  Map<String, dynamic>? get user => _userData;

  AuthProvider() {
    checkAuth();
  }

  Future<void> checkAuth() async {
    _isLoading = true;
    notifyListeners();
    _isAuthenticated = await AuthService.isLoggedIn();
    // In a real app, we'd fetch profile here
    if (_isAuthenticated) {
      _userData = {'name': 'Explorer'}; 
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final data = await AuthService.login(email, password);
    _userData = data['user'] ?? {'name': 'Explorer'};
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> signup(String name, String email, String password) async {
    final data = await AuthService.signup(name, email, password);
    _userData = data['user'] ?? {'name': name};
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> logout() async {
    await AuthService.logout();
    _userData = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
