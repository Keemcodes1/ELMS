import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertiesAPI, financeAPI, maintenanceAPI } from '../../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [propertyStats, financeStats, maintenanceStats] = await Promise.all([
                propertiesAPI.getStatistics(),
                financeAPI.getStatistics(),
                maintenanceAPI.getStatistics(),
            ]);

            setStats({
                properties: propertyStats.data,
                finance: financeStats.data,
                maintenance: maintenanceStats.data,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    const statCards = [
        { label: 'Total Properties', value: stats?.properties?.total_properties || 0, color: 'bg-blue-500' },
        { label: 'Total Units', value: stats?.properties?.total_units || 0, color: 'bg-green-500' },
        { label: 'Occupied', value: stats?.properties?.occupied_units || 0, color: 'bg-purple-500' },
        { label: 'Vacant', value: stats?.properties?.vacant_units || 0, color: 'bg-yellow-500' },
        { label: 'Total Collected', value: `UGX ${stats?.finance?.total_received?.toLocaleString() || 0}`, color: 'bg-emerald-500' },
        { label: 'Outstanding', value: `UGX ${stats?.finance?.total_outstanding?.toLocaleString() || 0}`, color: 'bg-red-500' },
        { label: 'Open Complaints', value: stats?.maintenance?.submitted + stats?.maintenance?.in_progress || 0, color: 'bg-orange-500' },
        { label: 'Resolved', value: stats?.maintenance?.resolved || 0, color: 'bg-teal-500' },
    ];

    const quickActions = user?.role === 'TENANT' ? [
        { label: 'Report Maintenance Issue', path: '/maintenance/new', primary: true },
        { label: 'View Available Units', path: '/available-units', primary: false },
        { label: 'Request Consultation', path: '/consultation', primary: false },
    ] : [
        { label: 'Add New Property', path: '/properties/new', primary: true },
        { label: 'Register New Tenant', path: '/tenants/new', primary: false },
        { label: 'Record Payment', path: '/finance/payments/new', primary: false },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome to your property management overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 ${stat.color} rounded-lg opacity-10`}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    <p className="text-gray-600">Activity feed coming soon...</p>
                </div>

                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                className={`w-full ${action.primary ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
