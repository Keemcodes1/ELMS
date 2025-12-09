import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    BanknotesIcon,
    WrenchScrewdriverIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isTenant = user?.role === 'TENANT';

    const navigation = isTenant ? [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'My Payments', href: '/finance', icon: BanknotesIcon },
        { name: 'Available Units', href: '/available-units', icon: BuildingOfficeIcon },
        { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon },
        { name: 'Consultation', href: '/consultation', icon: UserGroupIcon },
    ] : [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon },
        { name: 'Tenants', href: '/tenants', icon: UserGroupIcon },
        { name: 'Finance', href: '/finance', icon: BanknotesIcon },
        { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center h-16 bg-gray-800">
                        <h1 className="text-white text-xl font-bold">ELMS</h1>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user?.first_name?.[0] || 'U'}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">{user?.full_name || user?.username}</p>
                                <p className="text-xs text-gray-400">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="ml-64">
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
