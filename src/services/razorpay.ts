/**
 * Razorpay Frontend Service
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async ({
  amount,
  projectId,
  userId,
  userName,
  userEmail,
  userPhone,
  developerId,
  onSuccess,
  onError
}: {
  amount: number;
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  developerId?: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}) => {
  const isScriptLoaded = await loadRazorpayScript();

  if (!isScriptLoaded) {
    onError(new Error('Razorpay SDK failed to load. Are you online?'));
    return;
  }

  try {
    // 1. Create order on server
    const orderResponse = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt: projectId }),
    });

    const orderData = await orderResponse.json();

    if (orderData.error) {
      throw new Error(orderData.error);
    }

    // 2. Open Razorpay Checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'WebbyLaunch',
      description: 'Project Payment',
      order_id: orderData.id,
      handler: async (response: any) => {
        // 3. Save payment details on server
        try {
          const saveResponse = await fetch('/api/razorpay/save-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              projectId,
              amount,
              userId,
              developerId
            }),
          });

          const result = await saveResponse.json();
          if (result.success) {
            onSuccess(response);
          } else {
            throw new Error(result.error || 'Failed to save payment record');
          }
        } catch (error) {
          onError(error);
        }
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      theme: {
        color: '#c7c42a',
      },
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled by user'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    onError(error);
  }
};
