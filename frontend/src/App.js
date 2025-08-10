// src/App.js
import React, { useState } from 'react';  // Only this import is needed
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';
import LoginStaff from './components/LoginStaff';
import SignupStaff from './components/SignupStaff';
import Ldashboard from './components/Ldashboard';
import QRCreater from './components/QRCreater';

import Godown from './components/Godown';        // Import Godown component
import StaffGodown from './components/StaffGodown';


import Home from './components/Home';
import GodownDetail from './components/GodownDetail';
import Dgodowndetails from './components/Dgodowndetails';

import DstaffGodown from './components/DstaffGodown';

import ItemCountSummary from './components/ItemCountSummary'

import LoginForm from './components/LoginForm';
import GodownPage from './components/GodownPage';
import DeliveryPage from './components/DeliveryPage';
import InventoryPage from './components/InventoryPage';
import Sale from './components/Sale';
import Sales from './components/Sales';
import Dsale from './components/Dsale';
import History from './components/History';
import SelectForm from './components/SelectForm';
import BarcodeTable from './components/BarcodeTable';
import BillingMain from './components/BillingMain';
import CreateCustomer from './billing/CreateCustomer';
import CustomersList from './billing/CustomersList';
import CustomerDetails from './billing/CustomerDetails';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loginadmin" element={<AdminLogin />} />
        <Route path="/loginstaff" element={<LoginStaff />} />
        <Route path="/signupstaff" element={<SignupStaff/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="qr-creator" element={<QRCreater />} />
        <Route path="/ldashboard" element={<Ldashboard />} />
       
        <Route path="godown" element={<Godown />} />
        <Route path="sgodown" element={<StaffGodown />} />
        
        
        <Route path="home" element={<Home />} />
        <Route path="/godown-details" element={<GodownDetail />} />
        <Route path="/dgodowndetails" element={<Dgodowndetails />} />
         <Route path="/dstaffgodown" element={<DstaffGodown />} />
        <Route path="/itemCountSummary" element={<ItemCountSummary />} />
       
       
        <Route path="/staff-godown" element={<StaffGodown isAuthenticated={isAuthenticated} />} />

        <Route path="/loginfrom" element={<LoginForm />} />
      <Route path="godownpage/" element={<GodownPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/sale" element={<Sale/>} />
      <Route path="/sales" element={<Sales/>} />
      <Route path="/dsale" element={<Dsale/>} />
      <Route path="/history" element={<History/>} />
      <Route path="/selectfrom" element={<SelectForm/>} />

      <Route path="/BarcodeTable" element={<BarcodeTable/>} />
      <Route path="/billing" element={<BillingMain/>} />
      <Route path="/billing/create-customer" element={<CreateCustomer/>} />
      <Route path="/billing/customers-list" element={<CustomersList/>} />
      <Route path="/billing/customer-details/:id" element={<CustomerDetails/>} />
      <Route path="/customer/:id" element={<CustomerDetails/>} />

      </Routes>
    </Router>
  );
};

export default App;
