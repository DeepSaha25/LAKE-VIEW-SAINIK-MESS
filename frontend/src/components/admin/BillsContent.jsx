import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getResidents, updateResidentBill, calculateBillTotal } from '@/utils/storage';
import { Plus, IndianRupee, Calendar, CheckCircle2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const BillsContent = () => {
  const [residents, setResidents] = useState([]); // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [isAddBillDialogOpen, setIsAddBillDialogOpen] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  
  // Stores information about the bill being edited
  const [editingBill, setEditingBill] = useState(null); 
  
  const [billData, setBillData] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    rent: '',
    electricity: '',
    food: '',
    other: '',
    paid: false,
    dueDate: ''
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1];

  // Fetch residents from API on load
  const refreshResidents = async () => {
    setIsLoading(true);
    try {
      const data = await getResidents();
      setResidents(data || []);
    } catch (error) {
      toast.error("Failed to load bills data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshResidents();
  }, []);
  
  const openAddDialog = () => {
    setEditingBill(null);
    setSelectedResidentId('');
    setBillData({
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      rent: '',
      electricity: '',
      food: '',
      other: '',
      paid: false,
      dueDate: ''
    });
    setIsAddBillDialogOpen(true);
  };
  
  const openEditDialog = (bill) => {
    setEditingBill({ residentId: bill.residentId, month: bill.month, year: bill.year });
    setSelectedResidentId(bill.residentId);
    setBillData({
      month: bill.month,
      year: bill.year,
      rent: bill.rent.toString(),
      electricity: bill.electricity.toString(),
      food: bill.food.toString(),
      other: bill.other.toString(),
      paid: bill.paid,
      dueDate: bill.dueDate || ''
    });
    setIsAddBillDialogOpen(true);
  }

  const handleSaveBill = async () => {
    if (!selectedResidentId) {
      toast.error('Please select a resident');
      return;
    }

    if (!billData.month || !billData.year) {
      toast.error('Please select month and year');
      return;
    }

    const bill = {
      month: editingBill ? editingBill.month : billData.month,
      year: editingBill ? editingBill.year : parseInt(billData.year),
      
      rent: parseFloat(billData.rent) || 0,
      electricity: parseFloat(billData.electricity) || 0,
      food: parseFloat(billData.food) || 0,
      other: parseFloat(billData.other) || 0,
      paid: billData.paid,
      dueDate: billData.dueDate || new Date().toISOString().split('T')[0]
    };

    if (bill.paid) {
      bill.paidDate = new Date().toISOString().split('T')[0];
    } else {
      bill.paidDate = undefined;
    }

    try {
      await updateResidentBill(selectedResidentId, bill.month, bill.year, bill);
      toast.success(`Bill ${editingBill ? 'updated' : 'added'} successfully`);
      
      setBillData({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        rent: '', electricity: '', food: '', other: '', paid: false, dueDate: ''
      });
      setSelectedResidentId('');
      setEditingBill(null);
      setIsAddBillDialogOpen(false);
      refreshResidents();
    } catch (error) {
      toast.error('Failed to save bill');
    }
  };

  const handleMarkAsPaid = async (residentId, month, year) => {
    const resident = residents.find(r => r.id === residentId);
    const bill = resident?.bills.find(b => b.month === month && b.year === year);
    
    if (bill) {
      try {
        await updateResidentBill(residentId, month, year, {
          ...bill,
          paid: true,
          paidDate: new Date().toISOString().split('T')[0]
        });
        toast.success('Bill marked as paid');
        refreshResidents();
      } catch (error) {
        toast.error('Failed to update bill');
      }
    }
  };

  if (isLoading) {
    return <div className="p-6 space-y-4">
      <Skeleton className="h-12 w-48 mb-6" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>;
  }

  // Get all bills across residents
  const allBills = [];
  residents.forEach(resident => {
    resident.bills?.forEach(bill => {
      allBills.push({
        ...bill,
        residentId: resident.id,
        residentName: resident.name,
        room: resident.room
      });
    });
  });

  // Sort by date (newest first)
  allBills.sort((a, b) => {
    const dateA = new Date(`${a.month} ${a.year}`);
    const dateB = new Date(`${b.month} ${b.year}`);
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bills Management</h1>
          <p className="text-muted-foreground">Manage monthly bills for all residents</p>
        </div>
        
        <Dialog open={isAddBillDialogOpen} onOpenChange={setIsAddBillDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}> 
              <Plus className="h-4 w-4 mr-2" />
              Add Bill
            </Button>
          </DialogTrigger>
          {/* UPDATED: Better mobile responsiveness with scroll and width constraints */}
          <DialogContent className="w-[95vw] max-w-md sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBill ? 'Edit Monthly Bill' : 'Add Monthly Bill'}</DialogTitle>
              <DialogDescription>
                {editingBill ? 'Update the bill details for the selected resident' : 'Enter bill details for a resident'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="resident-select">Select Resident *</Label>
                <Select 
                  value={selectedResidentId} 
                  onValueChange={setSelectedResidentId}
                  disabled={!!editingBill} 
                >
                  <SelectTrigger id="resident-select">
                    <SelectValue placeholder="Choose a resident" />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month-select">Month *</Label>
                  <Select 
                    value={billData.month} 
                    onValueChange={(value) => setBillData({ ...billData, month: value })}
                    disabled={!!editingBill} 
                  >
                    <SelectTrigger id="month-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year-select">Year *</Label>
                  <Select 
                    value={billData.year.toString()} 
                    onValueChange={(value) => setBillData({ ...billData, year: parseInt(value) })}
                    disabled={!!editingBill}
                  >
                    <SelectTrigger id="year-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent">Rent (₹)</Label>
                  <Input
                    id="rent"
                    type="number"
                    value={billData.rent}
                    onChange={(e) => setBillData({ ...billData, rent: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="electricity">Electricity (₹)</Label>
                  <Input
                    id="electricity"
                    type="number"
                    value={billData.electricity}
                    onChange={(e) => setBillData({ ...billData, electricity: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food">Food (₹)</Label>
                  <Input
                    id="food"
                    type="number"
                    value={billData.food}
                    onChange={(e) => setBillData({ ...billData, food: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other">Other Charges (₹)</Label>
                  <Input
                    id="other"
                    type="number"
                    value={billData.other}
                    onChange={(e) => setBillData({ ...billData, other: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={billData.dueDate}
                  onChange={(e) => setBillData({ ...billData, dueDate: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="paid"
                  checked={billData.paid}
                  onChange={(e) => setBillData({ ...billData, paid: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="paid" className="cursor-pointer">Mark as paid</Label>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  {(
                    (parseFloat(billData.rent) || 0) +
                    (parseFloat(billData.electricity) || 0) +
                    (parseFloat(billData.food) || 0) +
                    (parseFloat(billData.other) || 0)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsAddBillDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveBill}>
                {editingBill ? 'Save Changes' : 'Add Bill'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
          <CardDescription>Complete history of all bills</CardDescription>
        </CardHeader>
        <CardContent>
          {allBills.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Rent</TableHead>
                    <TableHead className="text-right">Electricity</TableHead>
                    <TableHead className="text-right">Food</TableHead>
                    <TableHead className="text-right">Other</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBills.map((bill, index) => {
                    const total = calculateBillTotal(bill);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{bill.residentName}</TableCell>
                        <TableCell>{bill.room}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {bill.month} {bill.year}
                          </div>
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end">
                          <IndianRupee className="h-3 w-3" />
                          {bill.rent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="flex items-center justify-end">
                            <IndianRupee className="h-3 w-3" />
                            {bill.electricity.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="flex items-center justify-end">
                            <IndianRupee className="h-3 w-3" />
                            {bill.food.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="flex items-center justify-end">
                            <IndianRupee className="h-3 w-3" />
                            {bill.other.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          <span className="flex items-center justify-end">
                            <IndianRupee className="h-4 w-4" />
                            {total.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {bill.paid ? (
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Paid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!bill.paid && (
                            <div className='flex space-x-2'>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(bill)}
                              >
                                <Edit className='h-4 w-4'/>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(bill.residentId, bill.month, bill.year)}
                              >
                                Mark Paid
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bills found. Add your first bill to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillsContent;