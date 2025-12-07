import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, calculateBillTotal, getResidentById, getTotalPending } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Home, Calendar, IndianRupee } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [residentData, setResidentData] = useState(null); // Full data from API
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.type !== 'resident') {
      navigate('/');
      return;
    } 
    
    setCurrentUser(user);

    // Fetch full resident details (including bills) from API
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const data = await getResidentById(user.id);
        if (data) {
          setResidentData(data);
          // Set default month to latest bill
          if (data.bills && data.bills.length > 0) {
            setSelectedMonth(`${data.bills[0].month}-${data.bills[0].year}`);
          }
        }
      } catch (error) {
        console.error("Failed to load resident details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  if (isLoading) {
     return <div className="p-8"><Skeleton className="h-[200px] w-full rounded-xl" /></div>;
  }

  // Use residentData (from API) instead of currentUser (from LocalStorage) for bills
  const bills = residentData?.bills || [];
  
  const selectedBill = bills.find(
    (b) => `${b.month}-${b.year}` === selectedMonth
  );

  // UPDATED: Use the new utility function for total pending
  const totalDue = getTotalPending(residentData) || 0;

  let billStatus = 'Pending';
  if (selectedBill) {
    const total = calculateBillTotal(selectedBill);
    const paid = selectedBill.paidAmount || 0;
    
    if (paid >= total) {
      billStatus = 'Paid';
    } else if (paid > 0) {
      billStatus = 'Partial';
    } else {
      billStatus = 'Pending';
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary rounded-lg p-2">
                <Home className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Lakeview Sainik PG</h1>
                <p className="text-sm text-muted-foreground">Resident Portal</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-accent-light rounded-full p-3">
              <User className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Welcome, {currentUser.name}!</h2>
              <p className="text-muted-foreground">Room {currentUser.room}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Pending Dues</CardDescription>
              <CardTitle className="text-3xl text-destructive flex items-center">
                <IndianRupee className="h-6 w-6" />
                {totalDue.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Room Number</CardDescription>
              <CardTitle className="text-3xl">{currentUser.room}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Phone Number</CardDescription>
              <CardTitle className="text-xl">{residentData?.phone || currentUser.phone}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Month Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Select Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Choose a month" />
              </SelectTrigger>
              <SelectContent>
                {bills.map((bill) => (
                  <SelectItem key={`${bill.month}-${bill.year}`} value={`${bill.month}-${bill.year}`}>
                    {bill.month} {bill.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Bill Details */}
        {selectedBill ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {selectedBill.month} {selectedBill.year} Bill
                  </CardTitle>
                  <CardDescription>Detailed breakdown of your monthly charges</CardDescription>
                </div>
                <Badge variant={billStatus === 'Paid' ? 'default' : billStatus === 'Partial' ? 'warning' : 'destructive'} className="text-sm">
                  {billStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Rent</span>
                    <span className="font-semibold text-lg flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {selectedBill.rent.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Electricity</span>
                    <span className="font-semibold text-lg flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {selectedBill.electricity.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Food</span>
                    <span className="font-semibold text-lg flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {selectedBill.food.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Other</span>
                    <span className="font-semibold text-lg flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {selectedBill.other.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Total and Paid Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                      <p className="text-sm font-semibold text-foreground mb-1">Total Bill</p>
                      <span className="text-xl font-bold text-primary flex items-center">
                        <IndianRupee className="h-6 w-6" />
                        {calculateBillTotal(selectedBill).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 bg-success/10 rounded-lg border-2 border-success/20">
                      <p className="text-sm font-semibold text-foreground mb-1">Amount Paid</p>
                      <span className="text-xl font-bold text-success flex items-center">
                        <IndianRupee className="h-6 w-6" />
                        {(selectedBill.paidAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 bg-destructive/10 rounded-lg border-2 border-destructive/20">
                      <p className="text-sm font-semibold text-foreground mb-1">Remaining Due</p>
                      <span className="text-xl font-bold text-destructive flex items-center">
                        <IndianRupee className="h-6 w-6" />
                        {Math.max(0, calculateBillTotal(selectedBill) - (selectedBill.paidAmount || 0)).toLocaleString()}
                      </span>
                    </div>
                </div>
                
                {selectedBill.paidAmount > 0 && selectedBill.paidDate && (
                  <div className="text-center text-sm text-success">
                    First payment received on {new Date(selectedBill.paidDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                )}
                
                {billStatus !== 'Paid' && selectedBill.dueDate && (
                  <div className="text-center text-sm text-destructive">
                    Due date: {new Date(selectedBill.dueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No bill data available.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ResidentDashboard;