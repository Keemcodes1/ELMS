import { useState, useEffect } from 'react';
import { propertiesAPI } from '../../services/api';

const UnitForm = ({ propertyId, unit, onSave, onCancel }) => {
    const isEditMode = !!unit;
    const [formData, setFormData] = useState({
        unit_number: '',
        rent_amount: '',
        status: 'VACANT',
        bedrooms: 1,
        bathrooms: 1,
        floor_number: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (unit) {
            setFormData({
                unit_number: unit.unit_number,
                rent_amount: unit.rent_amount,
                status: unit.status,
                bedrooms: unit.bedrooms || 1,
                bathrooms: unit.bathrooms || 1,
                floor_number: unit.floor_number || 0,
            });
        }
    }, [unit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            ...formData,
            building: propertyId, // Ensure building ID is sent
        };

        try {
            if (isEditMode) {
                await propertiesAPI.updateUnit(unit.id, payload); // Assuming correct API method
            } else {
                await propertiesAPI.createUnit(payload); // Assuming correct API method
            }
            onSave();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to save unit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Unit Number</label>
                <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.unit_number}
                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Rent Amount (UGX)</label>
                <input
                    type="number"
                    required
                    className="input-field"
                    value={formData.rent_amount}
                    onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                    <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                    <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                    className="input-field"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                    <option value="VACANT">Vacant</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                >
                    {loading ? 'Saving...' : 'Save Unit'}
                </button>
            </div>
        </form>
    );
};

export default UnitForm;
