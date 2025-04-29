import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Create the context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    // On initial load, try to rehydrate from localStorage
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      return {
        accessToken: token,
        role: decoded.role,
        walletid: decoded.wallet_address,
      };
    }
    return { accessToken: null, role: null, walletid: null };
  });

  // Persist state to localStorage on change
  useEffect(() => {
    console.log("Auth state changed" );
    console.log(auth);
    console.log("Access Token: ", auth.accessToken);
    if (auth.accessToken) {
      localStorage.setItem("accessToken", auth.accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [auth.accessToken]);

  // Logout helper
  const logout = () => {
    setAuth({ accessToken: null, role: null, walletid: null });
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
