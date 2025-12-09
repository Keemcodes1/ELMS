import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesAPI } from '../../services/api';

const PropertyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        property_type: 'RESIDENTIAL',
        description: '',
        image: null as File | null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchProperty();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await propertiesAPI.getOne(id);
            const { name, address, property_type, description } = response.data;
            setFormData({ name, address, property_type, description, image: null });
        } catch (err) {
            setError('Failed to fetch property details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('address', formData.address);
            data.append('property_type', formData.property_type);
            data.append('description', formData.description);
            if (formData.image) {
                data.append('image', formData.image);
            }

            if (isEditMode) {
                await propertiesAPI.update(id, data);
            } else {
                await propertiesAPI.create(data);
            }
            navigate('/properties');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to save property');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.name) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Property' : 'Add New Property'}</h1>

            <form onSubmit={handleSubmit} className="card space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Property Name</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                        className="input-field"
                        value={formData.property_type}
                        onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    >
                        <option value="RESIDENTIAL">Residential</option>
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="INDUSTRIAL">Industrial</option>
                        <option value="MIXED">Mixed Use</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        className="input-field h-24"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary-50 file:text-primary-700
                            hover:file:bg-primary-100"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                    />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/properties')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Property' : 'Create Property')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PropertyForm;
