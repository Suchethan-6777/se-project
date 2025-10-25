import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, UserCog, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const StudentProfile = () => {
  const [user, setUser] = useState(null);
  const [invitationCode, setInvitationCode] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToFaculty = async (e) => {
    e.preventDefault();
    if (!invitationCode.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }

    setPromoting(true);
    try {
      await api.post('/auth/promote-to-faculty', {
        email: user.email,
        invitationCode: invitationCode.trim(),
      });
      toast.success('Successfully promoted to Faculty! Please log in again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Error promoting to faculty:', error);
      toast.error(error.response?.data?.message || 'Invalid invitation code');
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* User Information */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="p-3 rounded-full bg-gradient-primary">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">{user?.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
            </div>
            <Badge variant="default" className="text-sm">
              {user?.role}
            </Badge>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">User ID</Label>
              <p className="font-mono text-sm bg-muted p-2 rounded">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promote to Faculty */}
      {user?.role === 'STUDENT' && (
        <Card className="shadow-card border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              <CardTitle>Become a Faculty Member</CardTitle>
            </div>
            <CardDescription>
              Have an invitation code? Upgrade your account to Faculty to create and manage quizzes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePromoteToFaculty} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invitationCode">Invitation Code</Label>
                <Input
                  id="invitationCode"
                  type="text"
                  placeholder="Enter your invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  disabled={promoting}
                />
              </div>
              <Button type="submit" disabled={promoting} className="w-full">
                {promoting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Promoting...
                  </>
                ) : (
                  'Promote to Faculty'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentProfile;
