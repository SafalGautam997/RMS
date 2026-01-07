import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "Admin" | "Waiter";
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const [waiterPopup, setWaiterPopup] = useState<{
    tableNumber: number | null;
    customerName: string | null;
    createdAt: string;
  } | null>(null);
  const popupTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role !== "Waiter") return;

    const ensureAudioUnlocked = () => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
          void audioCtxRef.current.resume();
        }
      } catch {
        // ignore
      }
    };

    // Autoplay policies require a user gesture before sound.
    window.addEventListener("pointerdown", ensureAudioUnlocked, { once: true });
    window.addEventListener("keydown", ensureAudioUnlocked, { once: true });

    const playDing = () => {
      try {
        ensureAudioUnlocked();
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state !== "running") return;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        gain.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(988, ctx.currentTime);
        osc1.connect(gain);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.16);

        const osc2 = ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
        osc2.connect(gain);
        osc2.start(ctx.currentTime + 0.16);
        osc2.stop(ctx.currentTime + 0.36);
      } catch {
        // ignore
      }
    };

    const source = new EventSource("/api/notifications/stream");
    source.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data?.type === "call_waiter") {
          if (popupTimeoutRef.current) {
            window.clearTimeout(popupTimeoutRef.current);
            popupTimeoutRef.current = null;
          }

          setWaiterPopup({
            tableNumber:
              typeof data.table_number === "number" ? data.table_number : null,
            customerName:
              typeof data.customer_name === "string"
                ? data.customer_name
                : null,
            createdAt:
              typeof data.created_at === "string"
                ? data.created_at
                : new Date().toISOString(),
          });

          playDing();

          popupTimeoutRef.current = window.setTimeout(() => {
            setWaiterPopup(null);
            popupTimeoutRef.current = null;
          }, 7000);
        }
      } catch {
        // ignore
      }
    };
    source.onerror = () => {
      // Let the browser handle SSE reconnects; no UI needed.
    };

    return () => {
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }
      source.close();
    };
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    return (
      <Navigate to={user?.role === "Admin" ? "/admin" : "/waiter"} replace />
    );
  }

  return (
    <>
      {user?.role === "Waiter" && waiterPopup && (
        <div className="fixed top-4 right-4 z-50">
          <div className="card p-4 w-80">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-600">
                  Waiter Call
                </div>
                <div className="text-lg font-bold text-gray-900">
                  Table {waiterPopup.tableNumber ?? "N/A"}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  From: {waiterPopup.customerName ?? "Customer"}
                </div>
              </div>
              <button
                className="btn-secondary px-3 py-1 rounded-lg text-sm"
                onClick={() => setWaiterPopup(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
