import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  Camera,
  ClipboardList,
  Users,
  FileBarChart,
  CheckSquare,
} from 'lucide-react';
import { clsx } from 'clsx';

const studentNavItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: ROUTES.STUDENT_DASHBOARD  },
  { label: 'Mark Attendance', icon: Camera,        to: ROUTES.MARK_ATTENDANCE    },
  { label: 'My History',   icon: ClipboardList,   to: ROUTES.ATTENDANCE_HISTORY  },
];

const adminNavItems = [
  { label: 'Dashboard',      icon: LayoutDashboard, to: ROUTES.ADMIN_DASHBOARD },
  { label: 'Pending Requests', icon: CheckSquare,   to: ROUTES.ADMIN_PENDING   },
  { label: 'Reports',        icon: FileBarChart,    to: ROUTES.ADMIN_REPORTS   },
];

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full fixed left-0 top-16 bottom-0">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx('h-4 w-4 flex-shrink-0', isActive ? 'text-primary-600' : 'text-gray-400')}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          T&P Smart Attendance v1.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
