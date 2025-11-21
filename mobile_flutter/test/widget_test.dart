import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_flutter/main.dart';
import 'package:mobile_flutter/providers/auth_provider.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('Initial Load Smoke Test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    // Wrap with MultiProvider as main.dart does
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: const TripifyApp(),
      ),
    );

    // Initial state is loading (checking auth)
    // We expect to see a loader first
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Wait for auth check to complete
    await tester.pumpAndSettle();

    // After loading, since we mocked empty prefs, it should show LoginScreen
    // In LoginScreen, we look for the presence of the branding button.
    expect(find.text('UNLEASH ADVENTURE'), findsOneWidget);
  });
}

