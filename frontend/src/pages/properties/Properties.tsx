import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../../services/api';
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const Properties = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await propertiesAPI.getAll();
            // Handle pagination (DRF returns { count, next, previous, results })
            const data = response.data.results || response.data;
            setProperties(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
                    <p className="text-gray-600 mt-1">Manage your buildings and units</p>
                </div>
                <button
                    onClick={() => navigate('/properties/new')}
                    className="btn-primary flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Property
                </button>
            </div>

            {properties.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first property.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/properties/new')}
                            className="btn-primary"
                        >
                            Add Property
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <div
                            key={property.id}
                            className="card cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/properties/${property.id}`)}
                        >
                            {property.image ? (
                                <img
                                    src={property.image}
                                    alt={property.name}
                                    className="w-full h-48 object-cover rounded-t-lg -mx-6 -mt-6 mb-4 w-[calc(100%+3rem)]"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-t-lg -mx-6 -mt-6 mb-4 flex items-center justify-center">
                                    <BuildingOfficeIcon className="w-12 h-12 text-gray-300" />
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-gray-900">{property.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{property.address}</p>

                            <div className="mt-4 flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                                <div>
                                    <span className="font-semibold text-gray-900">{property.total_units}</span> Units
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${property.property_type === 'RESIDENTIAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                    }`}>
                                    {property.property_type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Properties;
