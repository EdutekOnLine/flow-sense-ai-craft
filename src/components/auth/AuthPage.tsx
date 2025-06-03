
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Workflow, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [invitationInfo, setInvitationInfo] = useState<any>(null);
  const [showSignup, setShowSignup] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check for invitation token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invite');
    
    console.log('Checking for invitation token:', token);
    console.log('Full URL:', window.location.href);
    
    if (token) {
      setInviteToken(token);
      setShowSignup(true);
      // Fetch invitation details
      fetchInvitationInfo(token);
    }
  }, []);

  const fetchInvitationInfo = async (token: string) => {
    try {
      console.log('Fetching invitation info for token:', token);
      
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('invitation_token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      console.log('Invitation data:', data, 'Error:', error);

      if (error || !data) {
        console.error('Invalid invitation:', error);
        toast({
          title: 'Invalid Invitation',
          description: 'This invitation link is invalid or has expired.',
          variant: 'destructive',
        });
        setInviteToken(null);
        setShowSignup(false);
        return;
      }

      setInvitationInfo(data);
      console.log('Successfully loaded invitation info:', data);
    } catch (error) {
      console.error('Error fetching invitation:', error);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Attempting sign in for:', email);

    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      console.log('Sign in successful');
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    console.log('Signup form data:', { email, firstName, lastName, inviteToken });

    // Validate email matches invitation if using invite token
    if (inviteToken && invitationInfo && email !== invitationInfo.email) {
      toast({
        title: 'Email mismatch',
        description: 'Please use the email address that was invited.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    console.log('Attempting signup with invitation bypass for:', email);

    // Use bypass email confirmation for invitation-based signups
    const { data, error } = await signUp(email, password, firstName, lastName, true);
    
    if (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      console.log('Signup successful for invitation-based user:', data);
      
      // Mark invitation as used
      if (inviteToken && invitationInfo) {
        try {
          const { error: updateError } = await supabase
            .from('user_invitations')
            .update({ used_at: new Date().toISOString() })
            .eq('id', invitationInfo.id);
          
          if (updateError) {
            console.error('Error marking invitation as used:', updateError);
          } else {
            console.log('Invitation marked as used successfully');
          }
        } catch (updateError) {
          console.error('Exception marking invitation as used:', updateError);
        }
      }
      
      toast({
        title: 'Account created!',
        description: 'Welcome to NeuraFlow. You can now start managing workflows.',
      });
      
      // Clear the invite token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Workflow className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">NeuraFlow</CardTitle>
          <CardDescription>
            Intelligent Workflow Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inviteToken && invitationInfo && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've been invited to join as a <strong>{invitationInfo.role}</strong>
                {invitationInfo.department && ` in ${invitationInfo.department}`}.
                Please create your account using the email: <strong>{invitationInfo.email}</strong>
              </AlertDescription>
            </Alert>
          )}

          {!inviteToken && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                New user registration requires an invitation from an administrator.
                Please contact your system administrator for access.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signin" value={showSignup ? "signup" : "signin"} onValueChange={(value) => setShowSignup(value === "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup" disabled={!inviteToken}>
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {inviteToken ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      value={invitationInfo?.email || ''}
                      placeholder="Enter your email"
                      required
                      readOnly={!!invitationInfo?.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    You need a valid invitation link to create an account.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
