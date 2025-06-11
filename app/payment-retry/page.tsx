import { Suspense } from "react";
import PaymentRetryClient from "./PaymentRetryClient";

export const dynamic = "force-dynamic";

export default function PaymentRetryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentRetryClient />
    </Suspense>
  );
} 