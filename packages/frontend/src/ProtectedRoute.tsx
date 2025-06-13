import React from "react";
import { Navigate } from "react-router";

interface IProtectedRouteProps {
    authToken: string;
    children: React.ReactNode;
}

export function ProtectedRoute(props: IProtectedRouteProps) {

    const savedToken = localStorage.getItem("authToken");
  

    if (!props.authToken && !savedToken) {
        return <Navigate to="/login" replace />
    }

    return props.children;
}