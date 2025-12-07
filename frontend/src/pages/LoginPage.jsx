import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminCredentials, getResidents, setCurrentUser } from '@/utils/storage';

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('admin');
  
  // Admin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Resident login state
  const [selectedResident, setSelectedResident] = useState('');
  const [residents, setResidents] = useState([]); // Initialize as empty array

  // NEW: Fetch residents from API on load
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const data = await getResidents();
        setResidents(data || []);
      } catch (error) {
        console.error("Failed to load residents", error);
        toast.error("Could not load resident list");
      }
    };
    fetchResidents();
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const adminCreds = getAdminCredentials();
    
    if (adminUsername === adminCreds.username && adminPassword === adminCreds.password) {
      setCurrentUser({ type: 'admin', ...adminCreds });
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleResidentLogin = (e) => {
    e.preventDefault();
    if (!selectedResident) {
      toast.error('Please select your name');
      return;
    }
    
    // Find full resident object from our API-loaded list
    const resident = residents.find(r => r.id === selectedResident);
    
    if (resident) {
      // Store minimal session info
      setCurrentUser({ type: 'resident', id: resident.id, name: resident.name, room: resident.room });
      toast.success(`Welcome, ${resident.name}!`);
      navigate('/resident');
    } else {
      toast.error('Resident not found');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Branding Section */}
        <div className="hidden md:flex flex-col justify-center space-y-6 px-8">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-xl p-3">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Lakeview Sainik</h1>
              <p className="text-muted-foreground">Mess PG Management</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-accent-light rounded-lg p-2 mt-1">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure Management</h3>
                <p className="text-sm text-muted-foreground">Safe and secure billing system for PG residents</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-success-light rounded-lg p-2 mt-1">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Easy Access</h3>
                <p className="text-sm text-muted-foreground">Quick login for both admins and residents</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="text-sm space-y-1">
              <p className="text-foreground"><span className="font-medium">Admin:</span> admin / admin123</p>
              <p className="text-foreground"><span className="font-medium">Resident:</span> Select from dropdown</p>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Choose your login type to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="resident">Resident</TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="Enter admin username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Login as Admin
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="resident">
                <form onSubmit={handleResidentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resident-select">Select Your Name</Label>
                    <Select value={selectedResident} onValueChange={setSelectedResident}>
                      <SelectTrigger id="resident-select">
                        <SelectValue placeholder="Choose your name from list" />
                      </SelectTrigger>
                      <SelectContent>
                        {residents.map((resident) => (
                          <SelectItem key={resident.id} value={resident.id}>
                            {resident.name} - Room {resident.room}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Login as Resident
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;