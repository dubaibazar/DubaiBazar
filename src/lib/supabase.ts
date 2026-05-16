/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bccivsjxmrfkvezxgygg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjY2l2c2p4bXJma3ZlenhneWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4OTA3MjMsImV4cCI6MjA5NDQ2NjcyM30.6_yPqTxRcyhHNSHIGp60rbPrL1vrhgfNU5QAGC3OrLw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

