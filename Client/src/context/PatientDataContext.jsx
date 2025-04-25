import { createContext, useContext, useState } from "react";

const PatientDataContext = createContext();

export function PatientDataProvider({ children }) {
  const [patients, setPatients] = useState([]); // Array of patient objects
  return (
    <PatientDataContext.Provider value={{ patients, setPatients }}>
      {children}
    </PatientDataContext.Provider>
  );
}

export function usePatientData() {
  return useContext(PatientDataContext);
}
