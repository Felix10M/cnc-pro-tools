# CNC Pro Tools — Flutter (versiune inițială)

Aplicație Flutter nativă, separată de APK-ul WebView existent. Include autentificare Supabase (aceleași conturi), calculatoare native de frezare/găurire, checklist WorkNC și profil.

## Local
Instalează Flutter SDK, apoi din directorul flutter-app rulează:
```sh
flutter create --platforms android --org ro.cncprotools .
flutter pub get
flutter run
```

## GitHub Actions
Workflow-ul flutter-android.yml generează APK de test și AAB nesemnat. Nu sunt gata pentru Google Play fără semnare, verificarea funcțiilor, politică de confidențialitate, ștergerea contului, teste și configurarea în Play Console.

**Atenție:** ID-ul Android generat este `ro.cncprotools.cnc_pro_tools`, diferit de `ro.cncprotools.app` din APK-ul WebView; se instalează ca aplicație separată.

Nu pune chei secrete Supabase/Stripe în aplicație. Cheia publicabilă Supabase este intenționat publică.
