import StripePackage from 'stripe';
import dotenv from 'dotenv';
import {ITicket} from '../models/booking.model';

// ENV variables
dotenv.config();
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;

// ids from products created in Stripe
const stripeItemIds = [
    {
        rate: 'Normal',
        priceId: 'price_1QVD4WP0QEHlx9DeQZRwZfBc'
    },
    {
        rate: 'Étudiant',
        priceId: 'price_1QVD55P0QEHlx9De8uxBjY6P'
    },
    {
        rate: 'Réduit',
        priceId: 'price_1QVD5aP0QEHlx9DeVRWr83dL'
    }
]

function findPriceId(rate: 'Normal' | 'Étudiant' | 'Réduit') {
    const foundItem = stripeItemIds.find((item) => item.rate === rate);
    return foundItem ? foundItem.priceId : '';
}

// Create a Stripe checkout session and redirects to the payment page
async function createCheckoutSession(items: ITicket[], bookingId: string, successUrl: string, cancelUrl: string) {
    const stripe = new StripePackage(STRIPE_API_KEY!);

    const stripeItems = items
        .map((item) => {
            return {
                price: findPriceId(item.rate),
                quantity: item.amount,
            };
        })
        .filter((item) => item.price); // Exclude items with invalid priceId

    try {
        return await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: stripeItems,
            mode: 'payment',
            success_url: `${successUrl}?success=true&bookingid=${bookingId}`,
            cancel_url: cancelUrl,
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

// Retrieve checkout session details and check status
async function checkPaymentStatus(sessionId: string | undefined) {
    const stripe = new StripePackage(STRIPE_API_KEY!);

    if (!sessionId) return false;

    try {
        const retrievedSession = await stripe.checkout.sessions.retrieve(sessionId);
        return retrievedSession.payment_status === 'paid';
    } catch (error) {
        console.error('Error retrieving session:', error);
        return false;
    }
}

export { createCheckoutSession, checkPaymentStatus };
