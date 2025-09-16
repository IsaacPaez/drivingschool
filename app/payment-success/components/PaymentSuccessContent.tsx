import React from "react";
import { usePaymentSuccess } from "../hooks/usePaymentSuccess";
import { PaymentUI } from "./PaymentUI";

export const PaymentSuccessContent: React.FC = () => {
  const { state } = usePaymentSuccess();

  return <PaymentUI state={state} />;
};
