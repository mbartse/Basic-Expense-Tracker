import { NavLink } from 'react-router-dom';
import { CalendarDays, CalendarRange, Calendar, Receipt, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Daily', icon: CalendarDays },
  { path: '/weekly', label: 'Weekly', icon: CalendarRange },
  { path: '/monthly', label: 'Monthly', icon: Calendar },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
];

export function BottomNav() {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 pt-safe z-50">
      <div className="flex justify-around items-center h-14">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-400'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-0.5">{label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive ? 'text-blue-400' : 'text-gray-400'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-0.5">Settings</span>
        </NavLink>
        <button
          onClick={signOut}
          className="flex flex-col items-center justify-center w-full h-full transition-colors text-gray-400 hover:text-red-400"
          title={user?.email || 'Sign out'}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span className="text-xs mt-0.5">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
