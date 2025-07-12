import { createContext } from "react";
import { UserContextType, initialUserContext } from "./userTypes";

export const UserContext = createContext<UserContextType>(initialUserContext); 