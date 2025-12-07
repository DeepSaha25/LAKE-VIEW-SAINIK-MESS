import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '@/utils/storage';
import Sidebar from '@/components/Sidebar';
import DashboardContent from '@/components/admin/DashboardContent';
import ResidentsContent from '@/components/admin/ResidentsContent';
import BillsContent from '@/components/admin/BillsContent';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);

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

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-8">
          {activeView === 'dashboard' && <DashboardContent />}
          {activeView === 'residents' && <ResidentsContent />}
          {activeView === 'bills' && <BillsContent />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;