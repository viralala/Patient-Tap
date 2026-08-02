// Supabase bootstrap + typed accessors.
// Every other backend file goes through here so demo mode has exactly one
// place to check: `Db.client` is null when no project is configured.

import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/app_config.dart';

class Db {
  Db._();

  static bool _initialised = false;

  /// Initialise Supabase if credentials were supplied. No-op in demo mode.
  static Future<void> init() async {
    if (_initialised || !AppConfig.hasSupabase) return;
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      // Accepts both the legacy anon key and the newer `sb_publishable_…` key.
      publishableKey: AppConfig.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
    );
    _initialised = true;
  }

  /// The live client, or null when running in demo mode.
  static SupabaseClient? get client =>
      _initialised ? Supabase.instance.client : null;

  static GoTrueClient? get auth => client?.auth;

  static User? get user => client?.auth.currentUser;

  static String? get userId => user?.id;

  static bool get isLive => _initialised;

  /// Invoke an Edge Function and return its JSON body.
  /// Throws [BackendException] with the server's message on failure.
  static Future<Map<String, dynamic>> invoke(
    String name, {
    Map<String, dynamic>? body,
  }) async {
    final SupabaseClient? c = client;
    if (c == null) {
      throw const BackendException('Backend not configured');
    }
    try {
      final FunctionResponse res = await c.functions.invoke(
        name,
        body: body ?? <String, dynamic>{},
      );
      final Object? data = res.data;
      if (res.status >= 400) {
        throw BackendException(_messageOf(data) ?? 'Request failed (${res.status})');
      }
      if (data is Map<String, dynamic>) return data;
      return <String, dynamic>{'ok': true, 'data': data};
    } on FunctionException catch (e) {
      throw BackendException(_messageOf(e.details) ?? 'Request failed');
    }
  }

  static String? _messageOf(Object? data) {
    if (data is Map && data['error'] is String) return data['error'] as String;
    if (data is Map && data['message'] is String) {
      return data['message'] as String;
    }
    if (data is String && data.isNotEmpty) return data;
    return null;
  }
}

class BackendException implements Exception {
  const BackendException(this.message);
  final String message;
  @override
  String toString() => message;
}
