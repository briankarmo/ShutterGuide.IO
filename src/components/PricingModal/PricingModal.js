import React, { useEffect, useContext } from "react";
import { AuthContext } from "../../context/UserContext";
import logoImage from "../../assets/img/SGAirStackedBlack.png";
import year299 from "../../assets/img/299y.png";
import year49 from "../../assets/img/49y.png";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PricingModal = ({ onClose, isLogin }) => {
  //   const monthlyPriceId = process.env.REACT_APP_STRIPE_MONTHLY_PRICE_ID;
  const yearlyPriceId = process.env.REACT_APP_STRIPE_YEARLY_PRICE_ID;

  const { user } = useContext(AuthContext);

  const handleSubscribe = async (priceId) => {
    try {
      const stripe = await stripePromise;
      // Update the fetch URL to use Netlify function
      const response = await fetch("/.netlify/functions/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
        }),
      }).catch((err) => {
        console.log(err);
      });

      const session = await response.json();

      if (!session || !session.id) {
        throw new Error("Failed to create session");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        // Only close if clicking the overlay background
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full md:max-w-[45%] text-black my-8 max-h-[90%] overflow-y-scroll no-scrollbar py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            WELCOME TO SHUTTERGUIDE
          </h2>
          <h3 className="text-xs md:text-sm font-bold">
            WHILE WE ARE WORKING ON GETTING NEW FEATURES,
          </h3>
          <h3 className="text-xs md:text-sm font-bold mb-4">
            YOU CAN GET YOUR FIRST YEAR FOR ONLY $49!
          </h3>
        </div>

        {/* Pricing Cards Container */}
        <div className="flex flex-row justify-center">
          {/* Monthly Plan */}
          <div className="bg-white p-3 mb-5 border-gray-300 xl:mb-0">
            <div className="mb-5 text-center">
              <img
                src={year299}
                alt="$299/y"
                className="w-[220px] h-auto mx-auto"
              />
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white p-3 md:mb-5 xl:mb-0 relative">
            <div className="mb-5 relative text-center">
              <img src={year49} alt="$49/y" className="h-full w-auto mx-auto" />
            </div>
          </div>
        </div>
        {isLogin && (
          <div className="flex flex-row justify-center mb-10">
            <button
              className="bg-black text-white font-bold px-10 py-2 rounded-2xl"
              onClick={() => handleSubscribe(yearlyPriceId)}
            >
              SELECT
            </button>
          </div>
        )}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-4">
            USE CODE 'FIRSTON'
          </h2>
          <h2 className="text-center text-[12px] mb-4">
            MUST GET A SUBSCRIPTION BEFORE PUBLISHING A PUBLIC PROFILE
          </h2>
          <img
            className="w-[150px] h-auto mx-auto"
            alt="logo"
            src={logoImage}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
