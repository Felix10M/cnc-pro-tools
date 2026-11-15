// Public configuration only. Never put Stripe secret keys or Supabase service-role keys here.
// Configure all three values after deploying the billing API and Supabase Auth.
window.CNC_PAYMENTS = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  apiBaseUrl: '',
  proPaymentLink: '' // Legacy fallback is deliberately disabled; use authenticated Checkout.
};
