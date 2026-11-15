(()=>{
'use strict';
const $=id=>document.getElementById(id);
const cfg=window.CNC_PAYMENTS||{};
const configured=!!(cfg.supabaseUrl&&cfg.supabaseAnonKey&&/^https:\/\//.test(cfg.apiBaseUrl||''));
const en=()=> $('lang')?.value==='en';
const message=(ro,english)=>{if($('accountMessage'))$('accountMessage').textContent=en()?english:ro};
const button=$('pricingSubscribe');
let client=null,session=null;
const updateUI=()=>{
 $('accountSignIn').hidden=!!session;
 $('accountSignOut').hidden=!session;
 $('accountPortal').hidden=!session;
 $('accountEmail').textContent=session?.user?.email||'';
 if(!configured)message('Conturile și plățile nu sunt încă activate. Configurarea serverului este în curs.','Accounts and payments are not active yet. Server setup is pending.');
};
async function token(){const result=await client.auth.getSession();if(result.error)throw result.error;const t=result.data.session?.access_token;if(!t)throw Error('Sign in required');return t}
async function api(path){const response=await fetch(cfg.apiBaseUrl.replace(/\/$/,'')+path,{method:path==='/subscription'?'GET':'POST',headers:{Authorization:'Bearer '+await token()}});if(!response.ok)throw Error('Request failed ('+response.status+')');return response.json()}
async function status(){if(!session)return;try{const result=await api('/subscription');$('accountStatus').textContent=result.pro?'PRO ✓': 'FREE';}catch{$('accountStatus').textContent='—';}}
async function init(){
 updateUI();
 if(!configured){button.disabled=true;button.title='Stripe / Supabase setup required';return}
 try{
  const module=await import('https://esm.sh/@supabase/supabase-js@2.49.10');
  client=module.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{detectSessionInUrl:true,persistSession:true}});
  const current=await client.auth.getSession();session=current.data.session;updateUI();await status();
  client.auth.onAuthStateChange((_event,next)=>{session=next;updateUI();setTimeout(status,0)});
  button.disabled=false;
 }catch{message('Autentificarea nu este disponibilă momentan.','Sign-in is temporarily unavailable.');button.disabled=true}
}
$('accountSignIn').addEventListener('click',async()=>{
 if(!client)return;
 const email=$('accountInput').value.trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){message('Introdu o adresă de e-mail validă.','Enter a valid email address.');return}
 try{const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;message('Verifică e-mailul pentru linkul de autentificare.','Check your email for the sign-in link.')}catch{message('Nu am putut trimite linkul. Încearcă din nou.','Could not send the link. Try again.')}
});
$('accountSignOut').addEventListener('click',async()=>{if(client)await client.auth.signOut();session=null;updateUI();$('accountStatus').textContent='—'});
$('accountPortal').addEventListener('click',async()=>{try{const data=await api('/portal');if(data.url)location.assign(data.url)}catch{message('Portalul nu este disponibil sau nu ai un abonament.','Billing portal unavailable or no subscription exists.')}});
// Override the beta placeholder handler by capturing the click before it reaches the legacy handler.
button.addEventListener('click',async(event)=>{
 event.stopImmediatePropagation();
 if(!configured)return;
 if(!session){message('Autentifică-te mai întâi folosind e-mailul.','Sign in with your email first.');$('accountInput').focus();return}
 button.disabled=true;
 try{const data=await api('/checkout');if(data.url&&/^https:\/\/checkout\.stripe\.com\//.test(data.url))location.assign(data.url);else throw Error('Invalid checkout URL')}
 catch{message('Plata nu este disponibilă momentan.','Checkout is temporarily unavailable.');button.disabled=false}
},true);
init();
})();
