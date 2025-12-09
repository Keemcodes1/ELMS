import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, BanknotesIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Invoice {
    id: number;
    amount: number;
    due_date: string;
    status: string;
    tenant?: { full_name: string };
}

interface Payment {
    id: number;
    amount: number;
    date_paid: string;
    payment_method: string;
    tenant?: { full_name: string };
}

const Finance = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'payments'
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'invoices') {
            fetchInvoices();
        } else {
            fetchPayments();
        }
    }, [activeTab]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await financeAPI.getInvoices();
            const data = response.data.results || response.data;
            setInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await financeAPI.getPayments();
            const data = response.data.results || response.data;
            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
                    <p className="text-gray-600 mt-1">Manage invoices and track payments</p>
                </div>
                {activeTab === 'payments' && user?.role !== 'TENANT' && (
                    <button
                        onClick={() => navigate('/finance/payments/new')}
                        className="btn-primary flex items-center"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Record Payment
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`${activeTab === 'invoices'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        Invoices
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`${activeTab === 'payments'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <BanknotesIcon className="w-5 h-5 mr-2" />
                        Payments
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {activeTab === 'invoices' ? (
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Due</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeTab === 'invoices' && invoices.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No invoices found.</td></tr>
                            )}
                            {activeTab === 'payments' && payments.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No payments found.</td></tr>
                            )}

                            {activeTab === 'invoices' && invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{invoice.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {invoice.tenant?.full_name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(invoice.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {invoice.due_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === 'payments' && payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{payment.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.tenant?.full_name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.date_paid}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.payment_method}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Finance;
