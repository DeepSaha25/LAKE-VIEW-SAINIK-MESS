import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, calculateBillTotal } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Home, Calendar, IndianRupee } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.type !== 'resident') {
      navigate('/');
    } else {
      setCurrentUser(user);
      // Set current month as default
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      if (user.bills && user.bills.length > 0) {
        const latestBill = user.bills[0];
        setSelectedMonth(`${latestBill.month}-${latestBill.year}`);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  const selectedBill = currentUser.bills?.find(
    (b) => `${b.month}-${b.year}` === selectedMonth
  );

  const totalDue = currentUser.bills
    ?.filter((b) => !b.paid)
    .reduce((sum, bill) => sum + calculateBillTotal(bill), 0) || 0;

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
                <h1 className="text-2xl font-bold text-foreground">Lakeview Sanic PG</h1>
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
              <CardDescription>Total Pending</CardDescription>
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
              <CardTitle className="text-xl">{currentUser.phone}</CardTitle>
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
                {currentUser.bills?.map((bill) => (
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
                <Badge variant={selectedBill.paid ? 'default' : 'destructive'} className="text-sm">
                  {selectedBill.paid ? 'Paid' : 'Pending'}
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
                
                <div className="flex justify-between items-center p-6 bg-primary/10 rounded-lg border-2 border-primary/20">
                  <span className="text-xl font-semibold text-foreground">Total Amount</span>
                  <span className="text-3xl font-bold text-primary flex items-center">
                    <IndianRupee className="h-7 w-7" />
                    {calculateBillTotal(selectedBill).toLocaleString()}
                  </span>
                </div>
                
                {selectedBill.paid && selectedBill.paidDate && (
                  <div className="text-center text-sm text-success">
                    Paid on {new Date(selectedBill.paidDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                )}
                
                {!selectedBill.paid && selectedBill.dueDate && (
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
              <p className="text-muted-foreground">No bill data available. Please select a month.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ResidentDashboard;