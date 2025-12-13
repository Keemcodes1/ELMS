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

                        {/* Landlord & Admin Routes */}
                        <Route path="properties" element={
                            <PrivateRoute allowedRoles={['LANDLORD', 'ADMIN', 'CARETAKER']}>
                                <Properties />
                            </PrivateRoute>
                        } />
                        <Route path="properties/new" element={
                            <PrivateRoute allowedRoles={['LANDLORD', 'ADMIN']}>
                                <PropertyForm />
                            </PrivateRoute>
                        } />
                        <Route path="properties/:id" element={
                            <PrivateRoute allowedRoles={['LANDLORD', 'ADMIN', 'CARETAKER']}>
                                <PropertyDetails />
                            </PrivateRoute>
                        } />
                        <Route path="properties/:id/edit" element={
                            <PrivateRoute allowedRoles={['LANDLORD', 'ADMIN']}>
                                <PropertyForm />
                            </PrivateRoute>
                        } />
                        <Route path="tenants" element={
                            <PrivateRoute allowedRoles={['LANDLORD', 'ADMIN', 'CARETAKER']}>
                                <Tenants />
                            </PrivateRoute>
                        } />
                        <Route path="tenants/new" element={
                            <PrivateRoute allowedRoles={['LANDLORD', 'ADMIN']}>
                                <TenantForm />
                            </PrivateRoute>
                        } />
                        <Route path="tenants/:id/edit" element={
                            <PrivateRoute allowedRoles={['LANDLORD', 'ADMIN']}>
                                <TenantForm />
                            </PrivateRoute>
                        } />

                        {/* Finance Routes */}
                        <Route path="finance" element={<Finance />} />
                        <Route path="finance/payments/new" element={
                            <PrivateRoute allowedRoles={['LANDLORD', 'ADMIN']}>
                                <PaymentForm />
                            </PrivateRoute>
                        } />

                        {/* Maintenance Routes */}
                        <Route path="maintenance" element={<Maintenance />} />
                        <Route path="maintenance/new" element={<ComplaintForm />} />

                        {/* Tenant Routes */}
                        <Route path="available-units" element={
                            <PrivateRoute allowedRoles={['TENANT']}>
                                <AvailableUnits />
                            </PrivateRoute>
                        } />
                        <Route path="consultation" element={
                            <PrivateRoute allowedRoles={['TENANT']}>
                                <ConsultationForm />
                            </PrivateRoute>
                        } />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
