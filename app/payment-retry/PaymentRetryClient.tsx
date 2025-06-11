"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentRetryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams ? searchParams.get("userId") : null;
  const orderId = searchParams ? searchParams.get("orderId") : null;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !orderId) {
      setError("Missing payment information. Please try again from your cart.");
      setLoading(false);
      return;
    }
    // Limitar reintentos a 3 por orden
    const retryKey = `payment-retry-count-${orderId}`;
    let retryCount = Number(localStorage.getItem(retryKey) || "0");
    if (retryCount >= 3) {
      setError("Payment could not be processed after several attempts. Please contact support or try again later.");
      setLoading(false);
      return;
    }
    localStorage.setItem(retryKey, String(retryCount + 1));
    // Llamar al endpoint de reintento
    fetch(`/api/payments/retry?userId=${userId}&orderId=${orderId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to get new payment link");
        const data = await res.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          throw new Error("No payment URL returned");
        }
      })
      .catch((err) => {
        setError("Automatic payment retry failed. Please try again from your orders or contact support.");
        setLoading(false);
      });
  }, [userId, orderId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {loading && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2 text-blue-700">Retrying payment...</h2>
            <p className="text-gray-600">Please wait, you will be redirected automatically.</p>
          </>
        )}
        {error && (
          <>
            <h2 className="text-xl font-bold mb-2 text-red-600">Payment Retry Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold" onClick={() => router.push("/")}>Back to Home</button>
          </>
        )}
      </div>
      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 