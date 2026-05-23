/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gaidfigkaehfifpcwhfu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaWRmaWdrYWVoZmlmcGN3aGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTA2OTcsImV4cCI6MjA5NDQ2NjcyM30.exkD2vbtrZn8e5mkanCvz8gHB47_EqOg7AAvqdRv2Ls';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
  global: {
    fetch: (...args) => {
      const [resource, config] = args;
      const timeout = 8000; // 8 seconds timeout
      
      let abortController: AbortController | undefined;
      let signal = config?.signal;
      
      if (!signal) {
        abortController = new AbortController();
        signal = abortController.signal;
        setTimeout(() => abortController?.abort(), timeout);
      }
      
      return fetch(resource, { ...config, signal });
    }
  }
});

