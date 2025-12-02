import { PaymentResponse } from "@rozoai/intent-common";

export interface PaymentResult {
  success: boolean;
  payment?: PaymentResponse;
  error?: string;
}
