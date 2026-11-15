(()=>{
'use strict';
const $=id=>document.getElementById(id),cfg=window.CNC_PAYMENTS||{};
const authReady=!!(cfg.supabaseUrl&&cfg.supabaseAnonKey),apiReady=authReady&&/^https:\/\//.test(cfg.apiBaseUrl||'');
const en=()=> $('lang')?.value==='en';
const msg=(ro,english)=>{const v=en()?english:ro;$('entryMessage').textContent=v;$('accountMessage').textContent=v};
let client=null,session=null,recovery=false,adminAccount=false;
const gate=$('entryGate'),subscribe=$('pricingSubscribe');
function username(){return session?.user?.user_metadata?.username||session?.user?.email?.split('@')[0]||''}
function roleLabel(value){$('headerRole').textContent=value;$('accountStatus').textContent=value}
function ui(){gate.hidden=!!session;$('headerAccount').hidden=!session;if(session){$('headerUsername').textContent=username();$('accountUsername').value=session.user.user_metadata?.username||'';roleLabel(adminAccount?'👑 ADMIN':'FREE')}$('accountSignIn').hidden=!!session;$('accountSignOut').hidden=!session;$('accountPortal').hidden=!session;$('accountEmail').textContent=session?.user?.email||'';}
async function api(path){const {data,error}=await client.auth.getSession();if(error||!data.session)throw Error('Sign in required');const response=await fetch(cfg.apiBaseUrl.replace(/\/$/,'')+path,{method:path==='/subscription'?'GET':'POST',headers:{Authorization:'Bearer '+data.session.access_token}});if(!response.ok)throw Error('API unavailable');return response.json()}
async function refresh(){if(!session||!client)return;try{const check=await client.rpc('is_app_admin');adminAccount=!check.error&&check.data===true}catch{adminAccount=false}if(adminAccount){roleLabel('👑 ADMIN · PRO ✓');subscribe.hidden=true;return}subscribe.hidden=false;if(!apiReady){roleLabel('FREE');return}try{const s=await api('/subscription');roleLabel(s.pro?'PRO ✓':'FREE')}catch{$('accountStatus').textContent='FREE'}}
function validate(){const email=$('entryEmail').value.trim(),password=$('entryPassword').value;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error(en()?'Enter a valid email.':'Introdu un e-mail valid.');if(password.length<8)throw Error(en()?'Password must be at least 8 characters.':'Parola trebuie să aibă minimum 8 caractere.');return {email,password}}
async function authAction(mode){if(!client)return;if(recovery){const password=$('entryPassword').value;if(password.length<8){msg('Parola trebuie să aibă minimum 8 caractere.','Password must be at least 8 characters.');return}if(password!==$('entryConfirm').value){msg('Parolele nu coincid.','Passwords do not match.');return}try{const {error}=await client.auth.updateUser({password});if(error)throw error;recovery=false;session=(await client.auth.getSession()).data.session;ui();msg('Parola a fost schimbată.','Password updated.')}catch(e){msg('Nu am putut schimba parola.','Could not update password.')}return}let values;try{values=validate();if(mode==='register'){const name=$('entryUsername').value.trim();if(!/^[\p{L}\p{N}_ .-]{3,32}$/u.test(name))throw Error(en()?'Choose a username (3–32 letters, numbers, spaces, . _ -).':'Alege un nume de utilizator (3–32 caractere: litere, cifre, spații, . _ -).');values.username=name}if(mode==='register'&&values.password!==$('entryConfirm').value)throw Error(en()?'Passwords do not match.':'Parolele nu coincid.')}catch(e){msg(e.message,e.message);return}
 $('entryRegister').disabled=$('entryLogin').disabled=true;
 try{const result=mode==='register'?await client.auth.signUp({email:values.email,password:values.password,options:{emailRedirectTo:location.origin+location.pathname,data:{username:values.username}}}):await client.auth.signInWithPassword({email:values.email,password:values.password});if(result.error)throw result.error;session=result.data.session;ui();if(!session)msg('Cont creat! Verifică e-mailul pentru confirmare.','Account created! Check your email to confirm it.');else{msg('Autentificare reușită.','Signed in successfully.');refresh()}}catch(e){msg('Autentificarea nu a reușit: '+e.message,'Authentication failed: '+e.message)}finally{$('entryRegister').disabled=$('entryLogin').disabled=false}}
let authMode='login';
function setAuthMode(mode){
 if(recovery)return;
 authMode=mode;
 const register=mode==='register';
 $('entryUsernameWrap').hidden=!register;
 $('entryConfirmWrap').hidden=!register;
 $('entryRegister').hidden=!register;
 $('entryLogin').hidden=register;
 $('entryReset').hidden=register;
 $('entryModeLogin').setAttribute('aria-pressed',String(!register));
 $('entryModeRegister').setAttribute('aria-pressed',String(register));
 $('entryPassword').autocomplete=register?'new-password':'current-password';
 $('entryIntro').textContent=en()?(register?'Create your free account.':'Sign in with email and password.'):(register?'Creează-ți contul gratuit.':'Conectează-te cu e-mail și parolă.');
 $('entryMessage').textContent='';
}
$('entryModeLogin').addEventListener('click',()=>setAuthMode('login'));
$('entryModeRegister').addEventListener('click',()=>setAuthMode('register'));
setAuthMode('login');
$('entryRegister').addEventListener('click',()=>authAction('register'));
$('entryLogin').addEventListener('click',()=>authAction('login'));
$('entryReset').addEventListener('click',async()=>{if(!client)return;const email=$('entryEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){msg('Introdu e-mailul pentru resetare.','Enter your email to reset your password.');return}try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;msg('Dacă există contul, vei primi un e-mail de resetare.','If the account exists, you will receive a reset email.')}catch{msg('Nu am putut trimite cererea.','Could not send the request.')}});
$('accountSignIn').addEventListener('click',()=>{gate.hidden=false;$('entryEmail').value=$('accountInput').value||''});
$('headerLogout').addEventListener('click',()=>{$('accountSignOut').click()});
$('headerProfile').addEventListener('click',()=>{document.querySelector('[data-tab="pricing"]')?.click();$('accountUsername').focus()});
$('accountSaveUsername').addEventListener('click',async()=>{if(!client||!session)return;const name=$('accountUsername').value.trim();if(!/^[\p{L}\p{N}_ .-]{3,32}$/u.test(name)){msg('Numele trebuie să aibă 3–32 caractere valide.','Username must be 3–32 valid characters.');return}const {data,error}=await client.auth.updateUser({data:{username:name}});if(error){msg('Nu am putut salva numele.','Could not save username.');return}session={...session,user:data.user};ui();msg('Numele de utilizator a fost salvat.','Username saved.')});
$('accountSignOut').addEventListener('click',async()=>{if(client)await client.auth.signOut();session=null;adminAccount=false;subscribe.hidden=false;ui()});
$('accountPortal').addEventListener('click',async()=>{if(!apiReady)return;try{const r=await api('/portal');if(r.url)location.assign(r.url)}catch{msg('Portalul nu este disponibil.','Billing portal unavailable.')}});
subscribe.addEventListener('click',async e=>{e.stopImmediatePropagation();if(adminAccount){msg('Ai deja acces ADMIN gratuit.','You already have free ADMIN access.');return}if(!apiReady){msg('Plățile PRO nu sunt încă activate.','PRO payments are not active yet.');return}if(!session){gate.hidden=false;return}subscribe.disabled=true;try{const r=await api('/checkout');if(!/^https:\/\/checkout\.stripe\.com\//.test(r.url||''))throw Error('Invalid URL');location.assign(r.url)}catch{msg('Plata nu este disponibilă momentan.','Checkout unavailable.');subscribe.disabled=false}},true);
async function init(){subscribe.disabled=!apiReady;if(!authReady){$('entryBeta').hidden=false;msg('Conturile sunt în pregătire. Poți testa gratuit aplicația în versiunea beta.','Accounts are coming soon. You can try the free beta.');return}
 try{const mod=await import('https://esm.sh/@supabase/supabase-js@2.49.10');client=mod.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,detectSessionInUrl:true}});const {data,error}=await client.auth.getSession();if(error)throw error;session=data.session;ui();refresh();client.auth.onAuthStateChange((event,next)=>{session=next;if(!next)adminAccount=false;ui();if(event==='PASSWORD_RECOVERY'){recovery=true;gate.hidden=false;$('entryModeLogin').hidden=true;$('entryModeRegister').hidden=true;$('entryConfirmWrap').hidden=false;$('entryUsernameWrap').hidden=true;$('entryRegister').hidden=true;$('entryLogin').textContent='Salvează parola nouă / Save new password';msg('Introdu parola nouă de două ori și apasă Salvează.','Enter your new password twice and press Save.')}setTimeout(refresh,0)});msg('Creează un cont sau conectează-te pentru a continua.','Create an account or sign in to continue.')}catch{msg('Autentificarea nu este disponibilă.','Authentication is unavailable.');$('entryBeta').hidden=false}}
$('entryBeta').addEventListener('click',()=>{if(!authReady)gate.hidden=true});
init();
})();
