/* eslint-disable react/prop-types */
import { useAuth } from "../../hooks/useAuth";
import {Navigate} from 'react-router-dom'

export default function Protected({children}) {
  const { user, loading } = useAuth();

  if (loading) {
    return null
  }
  return <>
    {user ? children : <Navigate to="/" />} 
  </>


}
