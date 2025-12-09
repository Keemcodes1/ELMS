import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeAPI, tenantsAPI } from '../../services/api';

interface Tenant {
    id: number;
    full_name: string;
    unit?: {
        unit_number: string;
    };
}

const PaymentForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [formData, setFormData] = useState({
        tenant: '', // tenant ID
        amount: '',
        date_paid: new Date().toISOString().split('T')[0],
        payment_method: 'CASH',
        reference_number: '',
    });

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const response = await tenantsAPI.getAll();
            const data = response.data.results || response.data;
            setTenants(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load tenants', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await financeAPI.createPayment(formData);
            navigate('/finance');
        } catch (error) {
            console.error('Failed to record payment', error);
            alert('Failed to record payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Record Payment</h1>
            <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tenant</label>
                    <select
                        required
                        className="input-field"
                        value={formData.tenant}
                        onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
                    >
                        <option value="">-- Select Tenant --</option>
                        {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                                {tenant.full_name} ({tenant.unit?.unit_number || 'No Unit'})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (UGX)</label>
                    <input
                        type="number"
                        required
                        min="0"
                        className="input-field"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                    <input
                        type="date"
                        required
                        className="input-field"
                        value={formData.date_paid}
                        onChange={(e) => setFormData({ ...formData, date_paid: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                        className="input-field"
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    >
                        <option value="CASH">Cash</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="MOBILE_MONEY">Mobile Money</option>
                        <option value="CHECK">Check</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Reference Number / Notes</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Check No, Transaction ID"
                        value={formData.reference_number}
                        onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/finance')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Recording...' : 'Record Payment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;
