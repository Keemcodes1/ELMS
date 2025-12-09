import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceAPI, propertiesAPI } from '../../services/api';

interface Property {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    unit_number: string;
}

const ComplaintForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);

    const [formData, setFormData] = useState({
        property: '',
        unit: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (formData.property) {
            fetchUnits(formData.property);
        } else {
            setUnits([]);
        }
    }, [formData.property]);

    const fetchProperties = async () => {
        try {
            const response = await propertiesAPI.getAll();
            const data = response.data.results || response.data;
            setProperties(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load properties', error);
        }
    };

    const fetchUnits = async (propertyId) => {
        try {
            const response = await propertiesAPI.getUnits(propertyId);
            setUnits(response.data);
        } catch (error) {
            console.error('Failed to load units', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await maintenanceAPI.createComplaint(formData);
            navigate('/maintenance');
        } catch (error) {
            console.error('Failed to submit complaint', error);
            alert('Failed to submit complaint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Report Maintenance Issue</h1>
            <form onSubmit={handleSubmit} className="card space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Property</label>
                        <select
                            className="input-field"
                            value={formData.property}
                            onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                        >
                            <option value="">-- Select Property --</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unit (Optional)</label>
                        <select
                            className="input-field"
                            value={formData.unit}
                            disabled={!formData.property}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                            <option value="">-- Select Unit --</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>Unit {u.unit_number}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Issue Title</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        placeholder="e.g. Leaking Faucet"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="input-field"
                        placeholder="Describe the issue in detail..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                        className="input-field"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="EMERGENCY">Emergency</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/maintenance')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ComplaintForm;
