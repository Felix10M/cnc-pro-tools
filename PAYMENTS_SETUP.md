# CNC Pro Tools — plăți PRO (39 lei/lună)

## Ce este implementat
Butonul de abonare din secțiunea Abonamente deschide un Stripe Payment Link **numai după configurarea URL-ului**. Dacă nu este configurat, site-ul afișează că plățile nu sunt încă active. Nu se colectează date de card pe site.

## Activare
1. Clarifică forma legală/fiscală pentru abonamente recurente în România și creează un cont Stripe verificat.
2. În Stripe Dashboard → Products, creează **CNC Pro Tools PRO**, preț **39 RON**, **Recurring / Monthly**.
3. În Stripe Dashboard → Payment Links, creează un link pentru acest preț recurent. Testează-l întâi în **test mode**; nu utiliza un link de test pentru încasări reale.
4. Editează `payments-config.js`: pune URL-ul HTTPS `https://buy.stripe.com/...` în `proPaymentLink` și publică modificarea. **Nu publica niciodată cheia secretă Stripe**.
5. Testează abonarea, anularea, reînnoirea, rambursarea și comunicările către client.

## Limitare importantă
**Un Payment Link nu conferă automat acces PRO.** Aplicația este statică pe GitHub Pages și toate instrumentele rămân gratuite în beta. Pentru restricționarea funcțiilor PRO trebuie implementate conturi, un backend securizat, verificarea webhook-urilor Stripe și a drepturilor de acces pe server. Nu folosi localStorage sau ascunderea butoanelor ca protecție pentru funcții plătite.

## Alte obligații
Înainte de lansare: termeni, confidențialitate, informații despre abonament/anulare, documente fiscale și conformitate pentru consumatori. Verifică obligațiile cu un contabil/consultant juridic.
