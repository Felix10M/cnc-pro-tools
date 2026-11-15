# CNC Pro Tools — backend pentru abonamente PRO

Acesta este un **starter de backend**, nu un serviciu deja lansat. Site-ul GitHub Pages nu poate rula Node.js. Pentru încasări reale trebuie configurate Supabase, Stripe și un hosting pentru API.

## Pași
1. Clarifică forma juridică și obligațiile fiscale pentru abonamente recurente în România. Activează contul Stripe după aprobarea verificărilor.
2. Creează proiectul Supabase, activează autentificarea prin e-mail și rulează `server/schema.sql` în SQL Editor.
3. Creează produsul Stripe PRO cu preț recurent de **39 RON/lună**. Copiază **Price ID**, nu Product ID.
4. Publică directorul `server/` pe un serviciu de hosting Node.js cu HTTPS. Configurează variabilele din `.env.example` ca **secrete de server**, nu în fișierele publice.
5. Configurează în Stripe endpointul webhook `https://DOMENIU-API/webhook` pentru evenimentele `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Folosește webhook signing secret specific endpointului.
6. Testează în Stripe test mode: cont nou, checkout, anulare, plată eșuată, reînnoire, portal, webhook retries și permisiuni.
7. Conectează interfața la Supabase Auth și la API folosind access token Bearer; numai după aceea implementează controlul accesului PRO **pe server** și activează plățile live.

## Endpointuri
- `GET /health` — verificare funcționare
- `POST /checkout` — creează sesiune Stripe Checkout pentru utilizator autentificat
- `GET /subscription` — citește statutul PRO pentru utilizator autentificat
- `POST /portal` — deschide portalul de administrare a abonamentului
- `POST /webhook` — primește și verifică evenimentele Stripe

## Limitări și siguranță
- **Nu sunt conectate încă conturi de utilizator la interfața web.** Butonul public nu folosește momentan aceste endpointuri.
- **Nu există încă protecție reală a instrumentelor PRO**: conținutul HTML/JS public nu poate fi protejat doar prin ascunderea elementelor. Funcțiile premium trebuie mutate în API sau implementate într-o arhitectură care validează accesul pe server.
- `billing_subscriptions` este actualizat din evenimente Stripe verificate; accesul este valid doar la status `active` sau `trialing`.
- Adaugă înainte de lansare limitare de cereri, observabilitate, tratarea evenimentelor webhook în afara ordinii, prevenirea abonărilor duble, gestionarea conturilor șterse și teste automate.
- Pentru clienți sunt necesare termeni, politică de confidențialitate, informații despre anulare și documente fiscale corespunzătoare.

Pornire locală: `cd server && npm install && cp .env.example .env && npm start` (completează întâi variabilele). Nu comite fișierul `.env`.
