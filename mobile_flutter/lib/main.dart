import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    print("Warning: .env file not found. Falling back to defaults.");
  }
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const TripifyApp(),
    ),
  );
}

class TripifyApp extends StatelessWidget {
  const TripifyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tripify',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme, // Defaulting to the premium Dark experience
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          if (auth.isLoading) {
            return const Scaffold(
              backgroundColor: AppTheme.darkBg,
              body: Center(child: CircularProgressIndicator(color: AppTheme.brandGold)),
            );
          }
          return auth.isAuthenticated ? const MainNavigation() : const LoginScreen();
        },
      ),
    );
  }
}

