import { BrowserRouter as Router, Routes, Route, Navigate } from '@/lib/navigation';
import { Toaster } from 'sonner';
import { Suspense, lazy } from 'react';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './components/Providers/AuthProvider';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Loader from './components/ui/loader';

const Dashboard = lazy(() => import('@/views/Dashboard'));
const Login = lazy(() => import('@/views/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Procurement = lazy(() => import('./pages/procurement/Procurement.tsx'));
const Finance = lazy(() => import('./pages/finance/Finance'));
const Documents = lazy(() => import('./pages/Documents/Documents'));
const DocumentFolder = lazy(() => import('./pages/Documents/DocumentFolder'));
const Invoice = lazy(() => import('./pages/finance/Invoice'));


function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/finance/:id" element={<Invoice />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/documents/folder/:id" element={<DocumentFolder />} />
                {/* {/* <Route path="/projects" element={<Projects />} /> */}
                {/* <Route path="/projects" element={<Projects />} />
                <Route path="/crm/contacts" element={<Contacts />} />
                <Route path="/crm/contacts/new" element={<CreateContact />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/my-tasks" element={<MyTasks />} />
                <Route path="/calendar" element={<Calendar />} /> */}
                {/* <Route path="/calendar" element={<MyCalendar />} /> */}
                {/* <Route path="/crm/sales/proposals" element={<Proposals />} />
                <Route
                  path="/crm/sales/proposals/new"
                  element={<CreateProposal />}
                />
                <Route path="/finances/invoices" element={<Invoices />} />
                <Route
                  path="/finances/invoices/new"
                  element={<CreateInvoice />}
                />
                <Route
                  path="/finances/purchase-orders"
                  element={<PurchaseOrders />}
                />
                <Route
                  path="/finances/purchase-orders/new"
                  element={<CreatePurchaseOrder />}
                />
                <Route path="/settings" element={<Settings />} /> */}

                <Route path="/procurement" element={<Procurement />} />
              </Route>
              {
                // add a not found route
              }
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </Suspense>
          <Toaster 
          duration={900}
            toastOptions={{
              classNames: {
                toast: 'max-sm:!top-4 max-sm:!py-6',
              },
            }}
            className="max-sm:!top-0 max-sm:!bottom-auto max-sm:!mx-auto "
          />
        </Router>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
