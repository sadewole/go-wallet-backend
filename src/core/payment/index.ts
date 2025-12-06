const paymentHostname = 'api.paystack.co';

const initiateTransaction = async (data: { email: string; amount: string }) => {
  const response = await fetch(`${paymentHostname}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  return result;
};

const verifyTransaction = async (reference: string) => {
  const response = await fetch(
    `${paymentHostname}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const result = await response.json();

  return result;
};

export default { initiateTransaction, verifyTransaction };
