
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        navigate('/dashboard');
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          navigate('/dashboard');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (type) => {
    setLoading(true);
    try {
      if (type === 'email') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message,
          });
        } else {
          // Fetch user data after successful login
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const userData = await getUserData(session.user.id);
            if (userData) {
              // Store user data in local storage
              localStorage.setItem('user', JSON.stringify(userData));
              navigate('/dashboard');
            } else {
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch user data after login.",
              });
            }
          }
        }
      } else if (type === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message,
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fix the function where we're trying to fetch data from "profiles" which doesn't exist
  const getUserData = async (userId) => {
    try {
      // Since we don't have a profiles table, let's fetch from employees table instead
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      // Return employee data
      return {
        name: `${data.first_name} ${data.last_name}`,
        badge_number: data.badge_number,
        // Since we don't have role and department directly, get department name
        department: data.department_id || 'N/A'
      };
    } catch (error) {
      console.error('Error in getUserData:', error);
      return null;
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-full max-w-md p-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={() => handleLogin('email')} disabled={loading}>
            {loading ? "Loading" : "Login"}
          </Button>
          <div className="text-center text-gray-500">OR</div>
          <Button variant="outline" onClick={() => handleLogin('google')} disabled={loading}>
            {loading ? "Loading" : "Login with Google"}
          </Button>
          <div className="text-sm text-gray-500 mt-2 text-center">
            Don't have an account? <a href="/register" className="text-blue-600">Register</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
