import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/features/onboarding/presentation/screens/splash_screen.dart';
import 'package:kortana_wallet/features/onboarding/presentation/screens/welcome_screen.dart';
import 'package:kortana_wallet/features/onboarding/presentation/screens/create_wallet_screen.dart';
import 'package:kortana_wallet/features/onboarding/presentation/screens/import_wallet_screen.dart';
import 'package:kortana_wallet/features/auth/presentation/screens/lock_screen.dart';
import 'package:kortana_wallet/features/dashboard/presentation/screens/home_screen.dart';
import 'package:kortana_wallet/shared/widgets/kortana_scaffold.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/create',
        builder: (context, state) => const CreateWalletScreen(),
      ),
      GoRoute(
        path: '/import',
        builder: (context, state) => const ImportWalletScreen(),
      ),
      GoRoute(
        path: '/lock',
        builder: (context, state) => const LockScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => KortanaScaffold(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          // Add other shell routes here
        ],
      ),
    ],
  );
});

class KortanaApp extends ConsumerWidget {
  const KortanaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Kortana Wallet',
      theme: AppTheme.darkTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
