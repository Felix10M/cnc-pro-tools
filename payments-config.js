// Public configuration only. Never put Stripe secret keys or Supabase service-role keys here.
// Configure all three values after deploying the billing API and Supabase Auth.
window.CNC_PAYMENTS = {
  supabaseUrl: 'https://ubgsshwcqqslidocjwaa.supabase.co',
  supabaseAnonKey: 'sb_publishable_0QWQBuDKUcy3wXQcwXMGxw_2qZVimiP',
  apiBaseUrl: '',
  proPaymentLink: '' // Legacy fallback is deliberately disabled; use authenticated Checkout.
};
