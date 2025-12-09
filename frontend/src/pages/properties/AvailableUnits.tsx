import { useState, useEffect } from 'react';
import { unitsAPI } from '../../services/api';
import { HomeIcon } from '@heroicons/react/24/outline';

interface Building {
    name: string;
    image?: string;
}

interface Unit {
    id: number;
    unit_number: string;
    bedrooms: number;
    rent_amount: number;
    building: Building;
}

const AvailableUnits = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVacantUnits();
    }, []);

    const fetchVacantUnits = async () => {
        try {
            const response = await unitsAPI.getVacant();
            const data = response.data.results || response.data;
            setUnits(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch vacant units:', error);
            setUnits([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Available Units</h1>
                <p className="text-gray-600 mt-1">Browse vacant properties and units</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-8">Loading...</div>
                ) : units.map((unit) => (
                    <div key={unit.id} className="card p-0 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                            {unit.building?.image ? (
                                <img src={unit.building.image} alt={unit.building.name} className="w-full h-full object-cover" />
                            ) : (
                                <HomeIcon className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900">{unit.building?.name || 'Property'}</h3>
                            <p className="text-sm text-gray-500 mb-2">Unit {unit.unit_number} • {unit.bedrooms} Bedroom</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-primary-600 font-bold">UGX {unit.rent_amount?.toLocaleString()}</span>
                                <button className="btn-secondary text-xs">Request Views</button>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && units.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                        No vacant units available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableUnits;
