import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantsAPI, propertiesAPI, unitsAPI } from '../../services/api';

const TenantForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        id_number: '',
        next_of_kin_name: '',
        next_of_kin_phone: '',
        next_of_kin_relation: '',
        assigned_unit: '', // ID of the unit
    });

    const [properties, setProperties] = useState([]);
    const [vacantUnits, setVacantUnits] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProperties();
        if (isEditMode) {
            fetchTenant();
        }
    }, [id]);

    useEffect(() => {
        if (selectedProperty) {
            fetchVacantUnits(selectedProperty);
        } else {
            setVacantUnits([]);
        }
    }, [selectedProperty]);

    const fetchProperties = async () => {
        try {
            const response = await propertiesAPI.getAll();
            const data = response.data.results || response.data;
            setProperties(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load properties', err);
            setProperties([]);
        }
    };

    const fetchVacantUnits = async (propertyId) => {
        try {
            // Fetch all units for property and filter, or use specific endpoint if available
            // Assuming propertiesAPI.getUnits returns all units
            const response = await propertiesAPI.getUnits(propertyId);
            const vacant = response.data.filter(u => u.status === 'VACANT');
            setVacantUnits(vacant);
        } catch (err) {
            console.error('Failed to load units', err);
        }
    };

    const fetchTenant = async () => {
        try {
            const response = await tenantsAPI.getOne(id);
            const t = response.data;
            setFormData({
                first_name: t.user.first_name,
                last_name: t.user.last_name,
                email: t.user.email,
                phone_number: t.phone_number,
                id_number: t.id_number,
                next_of_kin_name: t.next_of_kin_name,
                next_of_kin_phone: t.next_of_kin_phone,
                next_of_kin_relation: t.next_of_kin_relation,
                assigned_unit: t.unit?.id || '',
            });
            if (t.unit?.building) {
                setSelectedProperty(t.unit.building.id);
            }
        } catch (err) {
            setError('Failed to fetch tenant details');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode) {
                await tenantsAPI.update(id, formData);
            } else {
                await tenantsAPI.create(formData);
            }
            navigate('/tenants');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || err.response?.data?.email?.[0] || 'Failed to save tenant';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Tenant' : 'Register New Tenant'}</h1>

            <form onSubmit={handleSubmit} className="card space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            required
                            className="input-field"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">ID / Passport Number</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.id_number}
                        onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    />
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Unit Assignment</h3>

                    {!isEditMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Property</label>
                                <select
                                    className="input-field"
                                    value={selectedProperty}
                                    onChange={(e) => setSelectedProperty(e.target.value)}
                                >
                                    <option value="">-- Select Property --</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Unit</label>
                                <select
                                    className="input-field"
                                    value={formData.assigned_unit}
                                    disabled={!selectedProperty}
                                    onChange={(e) => setFormData({ ...formData, assigned_unit: e.target.value })}
                                >
                                    <option value="">-- Select Unit --</option>
                                    {vacantUnits.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.unit_number} - UGX {u.rent_amount?.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    {isEditMode && (
                        <p className="text-sm text-gray-500 italic">Unit reassignment is managed separately.</p>
                    )}
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Next of Kin</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.next_of_kin_name}
                                onChange={(e) => setFormData({ ...formData, next_of_kin_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                className="input-field"
                                value={formData.next_of_kin_phone}
                                onChange={(e) => setFormData({ ...formData, next_of_kin_phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Relation</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.next_of_kin_relation}
                                onChange={(e) => setFormData({ ...formData, next_of_kin_relation: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/tenants')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Tenant' : 'Register Tenant')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenantForm;
