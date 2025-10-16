import {
  Asset,
  Horizon,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

interface StellarPayParams {
  account: Horizon.AccountResponse;
  publicKey: string;
  token: {
    key: string;
    address: string;
  };
  order: {
    address: string;
    pay_amount: number;
    salt?: string;
  };
  server: Horizon.Server;
}

export const StellarPayNow = async ({
  account,
  publicKey,
  token,
  order,
  server,
}: StellarPayParams): Promise<string> => {
  try {
    if (account && publicKey && server) {
      const amount = order?.pay_amount ?? 0;
      const memo = String(order?.salt ?? "");

      const asset =
        !token?.key || token?.key === "XLM"
          ? Asset.native()
          : new Asset(token?.key.replace("_XLM", ""), token?.address);

      const sourceAccount = await server.loadAccount(publicKey);
      if (!sourceAccount) {
        throw new Error("Source account not found");
      }

      const baseFee = await server.fetchBaseFee();

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: String(baseFee),
        networkPassphrase: Networks.PUBLIC,
      })
        .addOperation(
          Operation.payment({
            destination: order?.address ?? "",
            asset: asset,
            amount: String(amount),
          })
        )
        .addMemo(Memo.text(memo))
        .setTimeout(300)
        .build();

      return transaction.toXDR();
    } else {
      throw new Error("Account not found");
    }
  } catch (error) {
    throw error;
  }
};
