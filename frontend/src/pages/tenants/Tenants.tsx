import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenantsAPI } from '../../services/api';
import { UserPlusIcon, UserIcon, PhoneIcon, HomeIcon } from '@heroicons/react/24/outline';

const Tenants = () => {
    const navigate = useNavigate();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const response = await tenantsAPI.getAll();
            // Handle pagination (DRF returns { results: [] })
            const data = response.data.results || response.data;
            setTenants(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
            setTenants([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-gray-600 mt-1">Manage your tenants and lease agreements</p>
                </div>
                <button
                    onClick={() => navigate('/tenants/new')}
                    className="btn-primary flex items-center"
                >
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    Register Tenant
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                {tenant.user.first_name[0]}{tenant.user.last_name[0]}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{tenant.full_name}</div>
                                            <div className="text-sm text-gray-500">{tenant.id_number}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col text-sm text-gray-500">
                                        <span className="flex items-center"><PhoneIcon className="w-4 h-4 mr-1" /> {tenant.phone_number}</span>
                                        <span className="flex items-center mt-1"><UserIcon className="w-4 h-4 mr-1" /> {tenant.user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {tenant.unit ? (
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{tenant.unit.unit_number}</div>
                                            <div className="text-xs text-gray-500">{tenant.unit.building?.name}</div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => navigate(`/tenants/${tenant.id}/edit`)}
                                        className="text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tenants.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No tenants found. Register a new tenant to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tenants;
