import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Protected from "./auth/Protected";
import HubLayout from "./layout/HubLayout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import System from "./pages/System";
import Advanced from "./pages/Advanced";
import Processes from "./pages/Processes";
import Network from "./pages/Network";
import Docker from "./pages/Docker";
import Console from "./pages/Console";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/*"
          element={
            <Protected>
              <HubLayout>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/system" element={<System />} />
                  <Route path="/advanced" element={<Advanced />} />
                  <Route path="/processes" element={<Processes />} />
                  <Route path="/network" element={<Network />} />
                  <Route path="/docker" element={<Docker />} />
                  <Route path="/console" element={<Console />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </HubLayout>
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
