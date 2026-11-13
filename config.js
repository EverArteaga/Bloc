// Configuración de Supabase. La anon key es pública por diseño: la seguridad la da RLS (ver supabase.sql).
// Mientras tenga "TU-PROYECTO", la app funciona en modo local (sin login ni sincronización).
window.CONFIG = {
  SUPABASE_URL: 'https://dkqzlabvpyvqksuzuqtg.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcXpsYWJ2cHl2cWtzdXp1cXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2MDYyNjAsImV4cCI6MjExMDE4MjI2MH0.SFnFONlcUToU68OitRJV8m0rPLYqHYxYmJobufbHHTc'
};
