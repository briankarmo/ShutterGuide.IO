// netlify/functions/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { error } = require('daisyui/src/colors');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      clientEmail: process.env.REACT_APP_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.REACT_APP_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

exports.handler = async ({ body, headers }) => {
  try {

    
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const customerId = event.data.object.customer
    
    const customer = await stripe.customers.retrieve(customerId)
    
    const userId = customer.metadata.userId
    
    const db = admin.firestore();

    // Handle different webhook events
    switch (event.type) {
      case 'customer.subscription.created':
        // Save new subscription in Firebase
        await db.collection('subscriptions').doc(userId).set({
          subscriptionId: event.data.object.id,
          status: event.data.object.status,
          priceId: event.data.object.items.data[0].price.id,
          currentPeriodEnd: new Date(event.data.object.current_period_end * 1000),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;
      case 'customer.subscription.updated':
        // Save/Update subscription in Firebase
        await db.collection('subscriptions').doc(userId).set({
          subscriptionId: event.data.object.id,
          status: event.data.object.status,
          priceId: event.data.object.items.data[0].price.id,
          currentPeriodEnd: new Date(event.data.object.current_period_end * 1000),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case 'customer.subscription.deleted':
        // Remove subscription from Firebase
        await db.collection('subscriptions').doc(userId).set({
          status: 'canceled',
          canceledAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};