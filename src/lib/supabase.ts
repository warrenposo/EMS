
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration
 * 
 * This file handles the Supabase client initialization.
 * It will use the official Supabase integration variables when available,
 * or fallback to mock data for development.
 */

// Get environment variables from Supabase integration
// Use the values from Lovable's Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lizkalsahbpmznkajjyr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpemthbHNhaGJwbXpua2FqanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NDA5NTcsImV4cCI6MjA1ODExNjk1N30.iv9rCs5qcaufM6hEPEl5QalcsvIu5sBHAr5YfGzD1KI';

// Check if we have a Supabase URL and key
const hasValidConfig = !!(supabaseUrl && supabaseAnonKey);

// Create a Supabase client
let supabaseClient = null;
try {
  if (hasValidConfig) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully with URL:', supabaseUrl);
  } else {
    console.warn('Supabase credentials missing or invalid. Using demo mode with mock data.');
    supabaseClient = null;
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  supabaseClient = null;
}

// Export the client
export const supabase = supabaseClient;

/**
 * Check if Supabase is properly configured
 * 
 * @returns {boolean} true if Supabase is configured with URL and key, false otherwise
 */
export const isSupabaseConfigured = () => {
  return hasValidConfig && supabase !== null;
};

/**
 * BIOMETRIC INTEGRATION POINT
 * 
 * This is where you can add your biometric API integration.
 * Example implementation:
 * 
 * export const sendBiometricData = async (data) => {
 *   // Implement your biometric API call here
 *   // Example: const response = await fetch('your-biometric-api-url', {...});
 *   // Return the response
 * }
 */
export const connectBiometricDevice = async (deviceId, config = {}) => {
  console.log('INTEGRATION POINT: Connect to biometric device', deviceId, config);
  // Implement your biometric device connection logic here
  return { success: true, message: 'This is a placeholder. Implement your biometric connection here.' };
};

export const receiveBiometricData = async (data) => {
  console.log('INTEGRATION POINT: Process biometric data', data);
  // Implement your biometric data processing logic here
  // When implemented, this should store attendance records in the database
  return { success: true, message: 'This is a placeholder. Implement your biometric data handling here.' };
};
