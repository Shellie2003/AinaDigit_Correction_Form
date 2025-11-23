import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcemiryxnocjaqnpocil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZW1pcnl4bm9jamFxbnBvY2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODA4NzcsImV4cCI6MjA3OTQ1Njg3N30.TB3B3wEo-xwFiD_f17uuWUuKptA-zfofI7wakpr-Kss';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);