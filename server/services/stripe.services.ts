import stripePackage from 'stripe';
import dotenv from 'dotenv';
import {ITicket} from '../models/booking.model';

// ENV variables
dotenv.config();
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;

// ids from products created in Stripe
const stripeItemIds = [
  {
    rate: 'Normal',
    priceId: 'prod_REz5uLaJo41UKD'
  },
  {
    rate: 'Étudiant',
    priceId: 'prod_REz4HHHGXl1Lyz'
  },
  {
    rate: 'Réduit',
    priceId: 'prod_REz5uLaJo41UKD'
  }
]

function findPriceId(rate: 'Normal' | 'Étudiant' | 'Réduit') {
  const foundItem = stripeItemIds.find((item) => item.rate === rate);
  return foundItem ? foundItem.priceId : '';
}

// Create a Stripe checkout session and redirects to the payment page
async function createCheckoutSession(items: ITicket[], bookingId: string, successUrl: string, cancelUrl: string) {
  const stripe = new stripePackage(STRIPE_API_KEY!);

  const stripeItems = items.map((item) => {
    return ({
      price: findPriceId(item.rate),
      quantity: item.amount
    })
  })

  return await stripe.checkout.sessions.create({
      line_items: stripeItems,
      mode: 'payment',
      success_url: `${successUrl}?success=true&bookingid=${bookingId}`,
      cancel_url: `${cancelUrl}`,
  })

}

// Retrieve checkout session details and check status
async function checkPaymentStatus(sessionId: string | undefined) {
  const stripe = new stripePackage(STRIPE_API_KEY!);

  if(!sessionId) return false;

  const retrievedSession = await stripe.checkout.sessions.retrieve(sessionId);
  return retrievedSession.payment_status === 'paid';
}



export { createCheckoutSession, checkPaymentStatus }
