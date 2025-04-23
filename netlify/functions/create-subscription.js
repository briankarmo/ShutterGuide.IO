// netlify/functions/create-subscription.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    console.log(event.httpMethod);
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { priceId, userId } = JSON.parse(event.body);

    const customer = await stripe.customers.create({
      metadata: {
        userId: userId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.DEPLOYED_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      allow_promotion_codes: true, // Enable Promotion Codes
      cancel_url: `${process.env.DEPLOYED_URL}/cancel`,
      client_reference_id: userId,
    });
    console.log("session", session);
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    // console.log(error);

    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
