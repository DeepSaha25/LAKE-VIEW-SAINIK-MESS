import { LayoutDashboard, Users, Receipt, LogOut, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = ({ activeView, setActiveView, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'residents', label: 'Residents', icon: Users },
    { id: 'bills', label: 'Bills', icon: Receipt }
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col sidebar-shadow">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-hover">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-lg p-2">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Lakeview Sanic</h2>
            <p className="text-xs text-sidebar-foreground/70">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-smooth',
                isActive
                  ? 'bg-sidebar-active text-sidebar-foreground font-medium'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-sidebar-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-hover">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;