import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { propertiesAPI, unitsAPI } from '../../services/api';
import UnitForm from './UnitForm';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);

    useEffect(() => {
        fetchPropertyData();
    }, [id]);

    const fetchPropertyData = async () => {
        try {
            setLoading(true);
            const [propRes, unitsRes] = await Promise.all([
                propertiesAPI.getOne(id),
                propertiesAPI.getUnits(id)
            ]);
            setProperty(propRes.data);
            setUnits(unitsRes.data);
        } catch (error) {
            console.error('Failed to load property data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnitSaved = () => {
        setIsUnitModalOpen(false);
        setEditingUnit(null);
        fetchPropertyData(); // Refresh list
    };

    if (loading) return <div>Loading...</div>;
    if (!property) return <div>Property not found</div>;

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                    <p className="text-gray-600">{property.address}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        {property.property_type}
                    </span>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => navigate(`/properties/${id}/edit`)}
                        className="btn-secondary"
                    >
                        Edit Property
                    </button>
                    <button
                        onClick={() => {
                            setEditingUnit(null);
                            setIsUnitModalOpen(true);
                        }}
                        className="btn-primary"
                    >
                        Add Unit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card bg-white p-4">
                    <p className="text-sm text-gray-500">Total Units</p>
                    <p className="text-2xl font-bold">{property.total_units}</p>
                </div>
                <div className="card bg-white p-4">
                    <p className="text-sm text-gray-500">Occupied</p>
                    <p className="text-2xl font-bold text-green-600">{property.occupied_units}</p>
                </div>
                <div className="card bg-white p-4">
                    <p className="text-sm text-gray-500">Vacant</p>
                    <p className="text-2xl font-bold text-red-600">{property.vacant_units}</p>
                </div>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Units</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {units.map((unit) => (
                                <tr key={unit.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{unit.unit_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">UGX {unit.rent_amount?.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${unit.status === 'VACANT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {unit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {unit.tenant ? unit.tenant.full_name : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setEditingUnit(unit);
                                                setIsUnitModalOpen(true);
                                            }}
                                            className="text-primary-600 hover:text-primary-900"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Unit Modal */}
            <Dialog open={isUnitModalOpen} onClose={() => setIsUnitModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 w-full shadow-xl">
                        <Dialog.Title className="text-lg font-medium mb-4">
                            {editingUnit ? 'Edit Unit' : 'Add New Unit'}
                        </Dialog.Title>

                        <UnitForm
                            propertyId={id}
                            unit={editingUnit}
                            onSave={handleUnitSaved}
                            onCancel={() => setIsUnitModalOpen(false)}
                        />
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default PropertyDetails;
