import React from "react";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionSuccess = () => {
    const navigate = useNavigate()

    const handleBack = () => {
        navigate('/');
    }

    return (
        <div className="max-w-2xl mx-auto p-8 text-center">
            <button onClick={handleBack} className="flex items-center text-gray-900 mb-6 hover:text-gray-500">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
            </button>
            <h1 className="text-2xl font-bold mb-4">Subscription Successful!</h1>
            <p>Thank you for subscribing. You now have access to all features.</p>
        </div>
    );
};

export default SubscriptionSuccess