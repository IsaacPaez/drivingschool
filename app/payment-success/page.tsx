"use client";
import React, { Suspense } from "react";
import { PaymentSuccessContent } from "./components/PaymentSuccessContent";
import { PaymentFallback } from "./components/PaymentFallback";

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
