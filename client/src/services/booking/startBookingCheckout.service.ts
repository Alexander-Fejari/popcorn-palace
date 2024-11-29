export const startBookingCheckout = async (bookingId: string) => {
  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const payload = JSON.stringify({
      "booking_id": bookingId,
      "success_url": `${import.meta.env.VITE_URL}/payment/confirmation`,
      "cancel_url": `${import.meta.env.VITE_URL}/payment?bookingid=${bookingId}`
    });

    const options = {
      method: "POST",
      credentials: 'include' as RequestCredentials,
      headers: headers,
      body: payload
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/checkout`, options);
    const body = await response.json();
    
    if(response.ok) {
      window.location.href = body.url
    } else {
      window.location.href = `${import.meta.env.VITE_URL}/payment/confirmation?success=false`
    }
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred during checkout');
  }
};
