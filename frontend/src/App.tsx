// @ts-nocheck
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Properties from './pages/properties/Properties';
import Tenants from './pages/tenants/Tenants';
import Finance from './pages/finance/Finance';
import Maintenance from './pages/maintenance/Maintenance';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';

import PropertyForm from './pages/properties/PropertyForm';
import PropertyDetails from './pages/properties/PropertyDetails';
import TenantForm from './pages/tenants/TenantForm';
import PaymentForm from './pages/finance/PaymentForm';
import ComplaintForm from './pages/maintenance/ComplaintForm';
import AvailableUnits from './pages/properties/AvailableUnits';
import ConsultationForm from './pages/common/ConsultationForm';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="properties" element={<Properties />} />
                        <Route path="properties/new" element={<PropertyForm />} />
                        <Route path="properties/:id" element={<PropertyDetails />} />
                        <Route path="properties/:id/edit" element={<PropertyForm />} />
                        <Route path="tenants" element={<Tenants />} />
                        <Route path="tenants/new" element={<TenantForm />} />
                        <Route path="tenants/:id/edit" element={<TenantForm />} />
                        <Route path="finance" element={<Finance />} />
                        <Route path="finance/payments/new" element={<PaymentForm />} />
                        <Route path="maintenance" element={<Maintenance />} />
                        <Route path="maintenance" element={<Maintenance />} />
                        <Route path="maintenance/new" element={<ComplaintForm />} />
                        <Route path="available-units" element={<AvailableUnits />} />
                        <Route path="consultation" element={<ConsultationForm />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
