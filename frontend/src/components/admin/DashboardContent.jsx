import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getResidents, calculateBillTotal } from '@/utils/storage';
import { Users, Home, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';

const DashboardContent = () => {
  const residents = getResidents();
  const maxCapacity = 15;
  const occupancyRate = ((residents.length / maxCapacity) * 100).toFixed(1);
  
  // Calculate statistics
  const totalPending = residents.reduce((sum, resident) => {
    const unpaidBills = resident.bills?.filter(b => !b.paid) || [];
    return sum + unpaidBills.reduce((billSum, bill) => billSum + calculateBillTotal(bill), 0);
  }, 0);
  
  const residentsWithDues = residents.filter(resident => {
    const unpaidBills = resident.bills?.filter(b => !b.paid) || [];
    return unpaidBills.length > 0;
  }).length;
  
  const totalCollected = residents.reduce((sum, resident) => {
    const paidBills = resident.bills?.filter(b => b.paid) || [];
    return sum + paidBills.reduce((billSum, bill) => billSum + calculateBillTotal(bill), 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of PG management statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Residents</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{residents.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-primary font-medium">{maxCapacity - residents.length}</span> rooms available
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
            <Home className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{occupancyRate}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-smooth"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive flex items-center">
              <IndianRupee className="h-6 w-6" />
              {totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-destructive font-medium">{residentsWithDues}</span> residents with dues
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success flex items-center">
              <IndianRupee className="h-6 w-6" />
              {totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">All-time collection</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Residents</CardTitle>
          <CardDescription>Latest additions to the PG</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {residents.slice(0, 5).map((resident) => {
              const unpaidBills = resident.bills?.filter(b => !b.paid) || [];
              const totalDue = unpaidBills.reduce((sum, bill) => sum + calculateBillTotal(bill), 0);
              
              return (
                <div key={resident.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center">
                      <span className="text-primary font-semibold">{resident.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{resident.name}</p>
                      <p className="text-sm text-muted-foreground">Room {resident.room}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {totalDue > 0 ? (
                      <>
                        <p className="font-semibold text-destructive flex items-center justify-end">
                          <IndianRupee className="h-4 w-4" />
                          {totalDue.toLocaleString()}
                        </p>
                        <Badge variant="destructive" className="mt-1">Pending</Badge>
                      </>
                    ) : (
                      <Badge variant="default">Cleared</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;