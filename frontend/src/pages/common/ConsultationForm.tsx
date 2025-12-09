import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConsultationForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        preferred_date: '',
        contact_method: 'PHONE'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulating API call since backend endpoint is pending
        setTimeout(() => {
            alert('Consultation request sent successfully! We will contact you shortly.');
            setLoading(false);
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Request Consultation</h1>
            <p className="text-gray-600 mb-8">Need to speak with a property manager? Fill out the form below.</p>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        placeholder="e.g. Lease Renewal Inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                        required
                        rows={4}
                        className="input-field"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={formData.preferred_date}
                            onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Method</label>
                        <select
                            className="input-field"
                            value={formData.contact_method}
                            onChange={(e) => setFormData({ ...formData, contact_method: e.target.value })}
                        >
                            <option value="PHONE">Phone Call</option>
                            <option value="EMAIL">Email</option>
                            <option value="IN_PERSON">In Person</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConsultationForm;
