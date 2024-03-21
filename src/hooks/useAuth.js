import { useContext } from "react";
import { AuthContext } from "../context/authProvider";

export const useAuth = () => useContext(AuthContext);
