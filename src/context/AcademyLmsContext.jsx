import { createContext, useContext } from "react";
import useAcademyLms from "../hooks/useAcademyLms";

const AcademyLmsContext = createContext(null);

export function AcademyLmsProvider({ children }) {
  const academyLms = useAcademyLms();
  return (
    <AcademyLmsContext.Provider value={academyLms}>
      {children}
    </AcademyLmsContext.Provider>
  );
}

export function useAcademyLmsContext() {
  const value = useContext(AcademyLmsContext);
  if (!value) {
    throw new Error("useAcademyLmsContext must be used within AcademyLmsProvider.");
  }
  return value;
}
