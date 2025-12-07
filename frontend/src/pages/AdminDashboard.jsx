import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '@/utils/storage';
import Sidebar from '@/components/Sidebar';
import DashboardContent from '@/components/admin/DashboardContent';
import ResidentsContent from '@/components/admin/ResidentsContent';
import BillsContent from '@/components/admin/BillsContent';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Building2, LogOut } from 'lucide-react'; // Added Menu icon

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // NEW State

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.type !== 'admin') {
      navigate('/');
    } else {
      setCurrentUser(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handler to close the sheet upon navigation
  const handleViewChange = (view) => {
    setActiveView(view);
    setIsSheetOpen(false); 
  }

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar (visible on md and up) */}
      <div className="hidden md:flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Mobile Header (visible ONLY on small screens) */}
        <header className="md:hidden sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button (Sheet Trigger) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                {/* Sidebar component is rendered inside the mobile drawer */}
                <Sidebar 
                  activeView={activeView} 
                  setActiveView={handleViewChange} // Use new handler
                  onLogout={handleLogout} 
                />
              </SheetContent>
            </Sheet>
            {/* Mobile Logout Button */}
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {activeView === 'dashboard' && <DashboardContent />}
          {activeView === 'residents' && <ResidentsContent />}
          {activeView === 'bills' && <BillsContent />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;