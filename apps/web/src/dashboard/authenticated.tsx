import type { InferResponseType } from "hono";
import React from "react";
import { Navigate } from "react-router-dom";
import { type ApiClient, useSession } from "../api-client";

export function Authenticated(
  props: { component: AuthenticatedComponent },
) {
  const { data } = useSession({ suspense: true });

  if (!data) {
    return <Navigate to="/login" />;
  }

  return <props.component session={data} />;
}

export function authenticated(component: AuthenticatedComponent) {
  return function AuthenticatedWrapper() {
    return <Authenticated component={component} />;
  };
}

export function Unauthenticated(
  props: { component: React.ComponentType; loading?: React.ReactNode },
) {
  const { data } = useSession({ suspense: true });

  if (data) {
    return <Navigate to="/" />;
  }

  return <props.component />;
}

export function unauthenticated(component: React.ComponentType) {
  return function UnauthenticatedWrapper() {
    return <Unauthenticated component={component} />;
  };
}

export type AuthenticatedComponent = React.ComponentType<
  { session: InferResponseType<ApiClient["sessions"]["$get"]> }
>;
