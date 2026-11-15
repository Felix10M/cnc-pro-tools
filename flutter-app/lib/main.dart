import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

const supabaseUrl = 'https://ubgsshwcqqslidocjwaa.supabase.co';
const supabaseKey = 'sb_publishable_0QWQBuDKUcy3wXQcwXMGxw_2qZVimiP';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseKey);
  runApp(const CncApp());
}

class CncApp extends StatelessWidget {
  const CncApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'CNC Pro Tools',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff21e6d4), brightness: Brightness.dark),
      scaffoldBackgroundColor: const Color(0xff071827),
      inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder()),
    ),
    home: const AuthGate(),
  );
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});
  @override
  State<AuthGate> createState() => _AuthGateState();
}
class _AuthGateState extends State<AuthGate> {
  final auth = Supabase.instance.client.auth;
  @override
  void initState() {
    super.initState();
    auth.onAuthStateChange.listen((_) { if (mounted) setState(() {}); });
  }
  @override
  Widget build(BuildContext context) => auth.currentSession == null ? const LoginPage() : const HomePage();
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}
class _LoginPageState extends State<LoginPage> {
  final email = TextEditingController();
  final password = TextEditingController();
  final confirm = TextEditingController();
  final username = TextEditingController();
  bool register = false, busy = false;
  String message = '';
  @override
  void dispose() { email.dispose(); password.dispose(); confirm.dispose(); username.dispose(); super.dispose(); }
  Future<void> submit() async {
    if (busy) return;
    if (!email.text.contains('@') || password.text.length < 8) {
      setState(() => message = 'Introdu un e-mail valid și o parolă de minimum 8 caractere.');
      return;
    }
    if (register && (password.text != confirm.text || username.text.trim().length < 3)) {
      setState(() => message = 'Verifică numele de utilizator și confirmarea parolei.');
      return;
    }
    setState(() { busy = true; message = ''; });
    try {
      final auth = Supabase.instance.client.auth;
      if (register) {
        await auth.signUp(email: email.text.trim(), password: password.text, data: {'username': username.text.trim()});
        if (mounted) setState(() => message = 'Verifică e-mailul pentru confirmarea contului.');
      } else {
        await auth.signInWithPassword(email: email.text.trim(), password: password.text);
      }
    } on AuthException catch (e) {
      if (mounted) setState(() => message = e.message);
    } catch (_) {
      if (mounted) setState(() => message = 'Conectarea nu a reușit. Încearcă din nou.');
    } finally { if (mounted) setState(() => busy = false); }
  }
  Future<void> reset() async {
    if (!email.text.contains('@')) { setState(() => message = 'Introdu adresa de e-mail.'); return; }
    try {
      await Supabase.instance.client.auth.resetPasswordForEmail(email.text.trim());
      if (mounted) setState(() => message = 'Dacă există contul, vei primi un e-mail de resetare.');
    } catch (_) { if (mounted) setState(() => message = 'Nu am putut trimite cererea.'); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(child: Center(child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 440),
      child: ListView(shrinkWrap: true, padding: const EdgeInsets.all(24), children: [
        const Icon(Icons.precision_manufacturing, size: 76, color: Color(0xff21e6d4)),
        const SizedBox(height: 14),
        const Text('CNC Pro Tools', textAlign: TextAlign.center, style: TextStyle(fontSize: 29, fontWeight: FontWeight.bold)),
        const SizedBox(height: 28),
        SegmentedButton<bool>(
          segments: const [ButtonSegment(value: false, label: Text('Conectare')), ButtonSegment(value: true, label: Text('Înregistrare'))],
          selected: {register}, onSelectionChanged: (v) => setState(() { register = v.first; message = ''; }),
        ),
        const SizedBox(height: 18),
        if (register) ...[TextField(controller: username, decoration: const InputDecoration(labelText: 'Nume de utilizator')), const SizedBox(height: 12)],
        TextField(controller: email, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.email], decoration: const InputDecoration(labelText: 'E-mail')),
        const SizedBox(height: 12),
        TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Parolă (minimum 8 caractere)')),
        if (register) ...[const SizedBox(height: 12), TextField(controller: confirm, obscureText: true, decoration: const InputDecoration(labelText: 'Confirmă parola'))],
        const SizedBox(height: 20),
        FilledButton(onPressed: busy ? null : submit, child: Text(busy ? 'Se procesează...' : register ? 'Creează cont' : 'Conectează-te')),
        if (!register) TextButton(onPressed: reset, child: const Text('Ai uitat parola?')),
        if (message.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 12), child: Text(message, textAlign: TextAlign.center)),
      ]),
    ))),
  );
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}
class _HomePageState extends State<HomePage> {
  int selected = 0;
  @override
  Widget build(BuildContext context) {
    final pages = [const CuttingCalculator(), const DrillingCalculator(), const WorkncChecklist(), const AccountPage()];
    return Scaffold(
      appBar: AppBar(title: const Text('⚙ CNC Pro Tools'), backgroundColor: const Color(0xff102d40)),
      body: SafeArea(child: pages[selected]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selected,
        onDestinationSelected: (index) => setState(() => selected = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.calculate), label: 'Frezare'),
          NavigationDestination(icon: Icon(Icons.hardware), label: 'Găurire'),
          NavigationDestination(icon: Icon(Icons.checklist), label: 'WorkNC'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Cont'),
        ],
      ),
    );
  }
}

class NumberInput extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  const NumberInput(this.label, this.controller, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: TextField(controller: controller, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: InputDecoration(labelText: label)),
  );
}
double? number(TextEditingController c) => double.tryParse(c.text.trim().replaceAll(',', '.'));
String fmt(double n) => n.isFinite ? n.toStringAsFixed(2) : '—';

class CuttingCalculator extends StatefulWidget {
  const CuttingCalculator({super.key});
  @override
  State<CuttingCalculator> createState() => _CuttingCalculatorState();
}
class _CuttingCalculatorState extends State<CuttingCalculator> {
  final diameter = TextEditingController(text: '10');
  final vc = TextEditingController(text: '150');
  final teeth = TextEditingController(text: '4');
  final fz = TextEditingController(text: '0.05');
  String result = '';
  @override
  void dispose() { for (final c in [diameter, vc, teeth, fz]) { c.dispose(); } super.dispose(); }
  void calculate() {
    final d = number(diameter), v = number(vc), z = number(teeth), f = number(fz);
    if (d == null || v == null || z == null || f == null || d <= 0 || v <= 0 || z <= 0 || f <= 0) {
      setState(() => result = 'Introdu valori pozitive valide.'); return;
    }
    final rpm = 1000 * v / (math.pi * d);
    setState(() => result = 'Turație n = ${fmt(rpm)} rpm\nAvans Vf = ${fmt(rpm * z * f)} mm/min');
  }
  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(20), children: [
    const Text('Calculator frezare', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
    const SizedBox(height: 16),
    NumberInput('Diametru freză D (mm)', diameter),
    NumberInput('Viteză de așchiere Vc (m/min)', vc),
    NumberInput('Număr dinți z', teeth),
    NumberInput('Avans pe dinte fz (mm/dinte)', fz),
    FilledButton(onPressed: calculate, child: const Text('Calculează')),
    const SizedBox(height: 20),
    SelectableText(result, style: const TextStyle(fontSize: 20)),
    const SizedBox(height: 20),
    const Text('Verifică parametrii în catalogul sculei și în limitele mașinii înainte de prelucrare.'),
  ]);
}

class DrillingCalculator extends StatefulWidget {
  const DrillingCalculator({super.key});
  @override
  State<DrillingCalculator> createState() => _DrillingCalculatorState();
}
class _DrillingCalculatorState extends State<DrillingCalculator> {
  final diameter = TextEditingController(text: '8');
  final vc = TextEditingController(text: '80');
  final fn = TextEditingController(text: '0.12');
  String result = '';
  @override
  void dispose() { for (final c in [diameter, vc, fn]) { c.dispose(); } super.dispose(); }
  void calculate() {
    final d = number(diameter), v = number(vc), f = number(fn);
    if (d == null || v == null || f == null || d <= 0 || v <= 0 || f <= 0) {
      setState(() => result = 'Introdu valori pozitive valide.'); return;
    }
    final rpm = 1000 * v / (math.pi * d);
    setState(() => result = 'Turație n = ${fmt(rpm)} rpm\nAvans Vf = ${fmt(rpm * f)} mm/min');
  }
  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(20), children: [
    const Text('Calculator găurire', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
    const SizedBox(height: 16),
    NumberInput('Diametru burghiu D (mm)', diameter),
    NumberInput('Viteză de așchiere Vc (m/min)', vc),
    NumberInput('Avans pe rotație fn (mm/rot)', fn),
    FilledButton(onPressed: calculate, child: const Text('Calculează')),
    const SizedBox(height: 20),
    SelectableText(result, style: const TextStyle(fontSize: 20)),
    const SizedBox(height: 20),
    const Text('Valorile sunt orientative; verifică recomandările producătorului sculei.'),
  ]);
}

class WorkncChecklist extends StatefulWidget {
  const WorkncChecklist({super.key});
  @override
  State<WorkncChecklist> createState() => _WorkncChecklistState();
}
class _WorkncChecklistState extends State<WorkncChecklist> {
  String mode = '3 axe';
  final checks = <String, bool>{};
  final tasks = <String, List<String>>{
    '3 axe': ['Verifică modelul și semifabricatul', 'Verifică originea și sistemul de coordonate', 'Verifică sculele și portsculele', 'Simulează traseele și coliziunile', 'Verifică postprocesorul și codul NC'],
    '3+2 axe': ['Confirmă orientările și planurile indexate', 'Verifică pivotul și lungimile sculelor', 'Verifică limitele axelor rotative', 'Simulează toate pozițiile indexate', 'Verifică codul NC pe controler'],
    '5 axe': ['Confirmă cinematica mașinii', 'Verifică TCP/RTCP și originea', 'Verifică limitele axelor rotative', 'Simulează coliziuni sculă, portsculă și mașină', 'Validează postprocesorul și codul NC'],
  };
  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(20), children: [
    const Text('WorkNC · Verificare CAM', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
    const SizedBox(height: 14),
    DropdownButtonFormField<String>(value: mode, decoration: const InputDecoration(labelText: 'Tip prelucrare'), items: tasks.keys.map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(), onChanged: (v) => setState(() { mode = v!; checks.clear(); })),
    const SizedBox(height: 16),
    for (final task in tasks[mode]!) CheckboxListTile(
      title: Text(task),
      value: checks[task] ?? false,
      onChanged: (v) => setState(() => checks[task] = v ?? false),
    ),
    const SizedBox(height: 12),
    Text('${checks.values.where((v) => v).length} / ${tasks[mode]!.length} verificări'),
    const SizedBox(height: 12),
    const Text('Checklist orientativ. Nu înlocuiește simularea completă și procedurile de siguranță ale mașinii.'),
  ]);
}

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});
  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;
    return ListView(padding: const EdgeInsets.all(24), children: [
      const Icon(Icons.account_circle, size: 72),
      const SizedBox(height: 12),
      Text(user?.userMetadata?['username']?.toString() ?? 'Utilizator', style: const TextStyle(fontSize: 24), textAlign: TextAlign.center),
      Text(user?.email ?? '', textAlign: TextAlign.center),
      const SizedBox(height: 24),
      const Text('Versiune Flutter · funcții de bază gratuite. Abonamentele nu sunt activate.'),
      const SizedBox(height: 24),
      OutlinedButton.icon(onPressed: () => Supabase.instance.client.auth.signOut(), icon: const Icon(Icons.logout), label: const Text('Deconectare')),
    ]);
  }
}
