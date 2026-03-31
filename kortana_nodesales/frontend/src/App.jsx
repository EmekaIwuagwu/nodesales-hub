import { Routes, Route, Navigate } from "react-router-dom";
import Landing    from "./pages/Landing";
import Buy        from "./pages/Buy";
import Dashboard  from "./pages/Dashboard";
import Admin      from "./pages/Admin";
import WalletModal from "./components/WalletModal";
import { useStore } from "./store/useStore";

function AdminRoute({ children }) {
  const { token, isAdmin } = useStore(s => ({ token: s.token, isAdmin: s.isAdmin }));
  if (!token)   return <Navigate to="/"         replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { walletModalOpen, closeWalletModal } = useStore();

  return (
    <>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/buy"       element={<Buy />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin"     element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global wallet selection modal — triggered by any connect() call */}
      <WalletModal isOpen={walletModalOpen} onClose={closeWalletModal} />
    </>
  );
}
