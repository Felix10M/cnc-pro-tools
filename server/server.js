import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import {createClient} from '@supabase/supabase-js';
const required=['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PRO_PRICE_ID','PUBLIC_SITE_ORIGIN','PUBLIC_SITE_URL'];
for(const key of required)if(!process.env[key])throw Error('Missing environment variable: '+key);
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const authClient=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const app=express();
app.disable('x-powered-by');
app.use(cors({origin:process.env.PUBLIC_SITE_ORIGIN}));
app.get('/health',(_req,res)=>res.json({ok:true}));
const validStatuses=new Set(['active','trialing']);
async function updateSubscription(sub){
 const customer=await admin.from('billing_customers').select('user_id').eq('stripe_customer_id',String(sub.customer)).maybeSingle();
 if(customer.error)throw customer.error;
 if(!customer.data)return;
 const row={user_id:customer.data.user_id,stripe_subscription_id:sub.id,status:sub.status,current_period_end:sub.current_period_end?new Date(sub.current_period_end*1000).toISOString():null,updated_at:new Date().toISOString()};
 const result=await admin.from('billing_subscriptions').upsert(row,{onConflict:'user_id'});
 if(result.error)throw result.error;
}
// Webhook must use RAW body and be registered before express.json().
app.post('/webhook',express.raw({type:'application/json'}),async(req,res)=>{
 let event;
 try{event=stripe.webhooks.constructEvent(req.body,req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET)}catch{return res.status(400).send('Invalid signature')}
 try{
  if(event.type==='checkout.session.completed'){
   const session=event.data.object;
   if(session.mode==='subscription'&&session.subscription)await updateSubscription(await stripe.subscriptions.retrieve(session.subscription));
  }
  if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type))await updateSubscription(event.data.object);
  res.json({received:true});
 }catch(err){console.error('Webhook failed',err);res.status(500).send('Retry later')}
});
app.use(express.json({limit:'16kb'}));
async function requireUser(req,res,next){
 const token=/^Bearer (.+)$/i.exec(req.headers.authorization||'')?.[1];
 if(!token)return res.status(401).json({error:'Sign in required'});
 const {data,error}=await authClient.auth.getUser(token);
 if(error||!data?.user)return res.status(401).json({error:'Invalid session'});
 req.user=data.user;next();
}
async function isAdmin(userId){const result=await admin.from('app_admins').select('user_id').eq('user_id',userId).maybeSingle();if(result.error)throw result.error;return !!result.data}
app.get('/subscription',requireUser,async(req,res)=>{
 try{if(await isAdmin(req.user.id))return res.json({pro:true,admin:true,status:'admin',currentPeriodEnd:null})}catch{return res.status(500).json({error:'Admin status unavailable'})}
 const {data,error}=await admin.from('billing_subscriptions').select('status,current_period_end').eq('user_id',req.user.id).maybeSingle();
 if(error)return res.status(500).json({error:'Subscription unavailable'});
 res.json({pro:validStatuses.has(data?.status),status:data?.status||'none',currentPeriodEnd:data?.current_period_end||null});
});
app.post('/checkout',requireUser,async(req,res)=>{
 try{
  if(await isAdmin(req.user.id))return res.status(409).json({error:'Admin already has PRO access'});
  let {data:row,error}=await admin.from('billing_customers').select('stripe_customer_id').eq('user_id',req.user.id).maybeSingle();
  if(error)throw error;
  let customerId=row?.stripe_customer_id;
  if(!customerId){
   const customer=await stripe.customers.create({email:req.user.email,metadata:{supabase_user_id:req.user.id}});
   customerId=customer.id;
   const saved=await admin.from('billing_customers').upsert({user_id:req.user.id,stripe_customer_id:customerId},{onConflict:'user_id'});
   if(saved.error)throw saved.error;
  }
  const session=await stripe.checkout.sessions.create({mode:'subscription',customer:customerId,line_items:[{price:process.env.STRIPE_PRO_PRICE_ID,quantity:1}],success_url:process.env.PUBLIC_SITE_URL+'?billing=success',cancel_url:process.env.PUBLIC_SITE_URL+'?billing=cancel'});
  res.json({url:session.url});
 }catch(err){console.error('Checkout failed',err);res.status(500).json({error:'Checkout unavailable'})}
});
app.post('/portal',requireUser,async(req,res)=>{
 const {data,error}=await admin.from('billing_customers').select('stripe_customer_id').eq('user_id',req.user.id).maybeSingle();
 if(error)return res.status(500).json({error:'Billing unavailable'});
 if(!data)return res.status(404).json({error:'No billing account'});
 try{const session=await stripe.billingPortal.sessions.create({customer:data.stripe_customer_id,return_url:process.env.PUBLIC_SITE_URL});res.json({url:session.url})}catch(err){console.error('Portal failed',err);res.status(500).json({error:'Billing unavailable'})}
});
app.listen(Number(process.env.PORT)||3000,()=>console.log('Billing API listening'));
