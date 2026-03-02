import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, DoorOpen, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/tenants', icon: Users, label: 'Tenants' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 border-r bg-card h-screen sticky top-0 shrink-0">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold text-primary">Dwella</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Rent Management</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
