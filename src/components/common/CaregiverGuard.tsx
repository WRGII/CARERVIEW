import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type Props = { children: React.ReactNode };

export default function CaregiverGuard({ children }: Props) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [expired, setExpired] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setExpired(true), 8000); // 8s safety cap
    return () => clearTimeout(t);
  }, []);

  if (profile?.disabled) {
    return <Navigate to={{ pathname: "/", hash: "#get-started" }} replace />;
  }

  if (loading && !expired) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-slate-gray mb-2">Preparing your caregiver workspace…</p>
        <p className="text-slate-gray/70 text-sm">
          If this takes more than a few seconds,{" "}
          <a href="/#get-started" className="text-cyan-primary underline">
            sign in again
          </a>.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={{ pathname: "/", hash: "#get-started" }}
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
}
