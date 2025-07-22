import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szkxnbzhgzlnutlmuvrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6a3huYnpoZ3psbnV0bG11dnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODI4MDIsImV4cCI6MjA2NTg1ODgwMn0.c1Trc1kHEt-oO98ryXBsXLaqgiHTmRiIxTIPYy-7TPI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);