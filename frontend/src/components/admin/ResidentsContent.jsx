import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getResidents, addResident, updateResident, deleteResident, calculateBillTotal } from '@/utils/storage';
import { Plus, Edit, Trash2, Phone, Mail, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const ResidentsContent = () => {
  const [residents, setResidents] = useState([]); // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    room: '',
    phone: '',
    email: ''
  });

  const maxCapacity = 15;

  // NEW: Fetch residents from API on load
  const refreshResidents = async () => {
    setIsLoading(true);
    try {
      const data = await getResidents();
      setResidents(data || []);
    } catch (error) {
      toast.error("Failed to load residents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshResidents();
  }, []);

  const handleAdd = async () => {
    if (!formData.name || !formData.room || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      await addResident(formData);
      toast.success('Resident added successfully');
      setFormData({ name: '', room: '', phone: '', email: '' });
      setIsAddDialogOpen(false);
      refreshResidents();
    } catch (error) {
      toast.error('Failed to add resident');
    }
  };

  const handleEdit = async () => {
    if (!formData.name || !formData.room || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      await updateResident(editingResident.id, formData);
      toast.success('Resident updated successfully');
      setEditingResident(null);
      setFormData({ name: '', room: '', phone: '', email: '' });
      setIsEditDialogOpen(false);
      refreshResidents();
    } catch (error) {
      toast.error('Failed to update resident');
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await deleteResident(id);
      toast.success(`${name} removed successfully`);
      refreshResidents();
    } catch (error) {
      toast.error('Failed to delete resident');
    }
  };

  const openEditDialog = (resident) => {
    setEditingResident(resident);
    setFormData({
      name: resident.name,
      room: resident.room,
      phone: resident.phone,
      email: resident.email || ''
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-6 space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
    </div>;
  }

  const canAddMore = residents.length < maxCapacity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Residents Management</h1>
          <p className="text-muted-foreground">
            {residents.length} of {maxCapacity} rooms occupied
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canAddMore}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resident</DialogTitle>
              <DialogDescription>Enter the details of the new resident</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Name *</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-room">Room Number *</Label>
                <Input
                  id="add-room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="e.g., 101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone Number *</Label>
                <Input
                  id="add-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email (Optional)</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Resident</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Capacity Warning */}
      {!canAddMore && (
        <Card className="border-warning bg-warning-light">
          <CardContent className="py-4">
            <p className="text-sm font-medium">Maximum capacity reached. Cannot add more residents.</p>
          </CardContent>
        </Card>
      )}

      {/* Residents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {residents.map((resident) => {
          const unpaidBills = resident.bills?.filter(b => !b.paid) || [];
          const totalDue = unpaidBills.reduce((sum, bill) => sum + calculateBillTotal(bill), 0);
          
          return (
            <Card key={resident.id} className="hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{resident.name}</CardTitle>
                    <CardDescription>Room {resident.room}</CardDescription>
                  </div>
                  {totalDue > 0 ? (
                    <Badge variant="destructive">Dues Pending</Badge>
                  ) : (
                    <Badge>Cleared</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {resident.phone}
                  </div>
                  {resident.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {resident.email}
                    </div>
                  )}
                  
                  {totalDue > 0 && (
                    <div className="bg-destructive-light p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Pending</p>
                      <p className="text-xl font-bold text-destructive flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        {totalDue.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Dialog open={isEditDialogOpen && editingResident?.id === resident.id} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditDialog(resident)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Resident</DialogTitle>
                          <DialogDescription>Update resident information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-room">Room Number *</Label>
                            <Input
                              id="edit-room"
                              value={formData.room}
                              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone Number *</Label>
                            <Input
                              id="edit-phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-email">Email (Optional)</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleEdit}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resident</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {resident.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(resident.id, resident.name)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isLoading && residents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No residents found. Add your first resident to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResidentsContent;