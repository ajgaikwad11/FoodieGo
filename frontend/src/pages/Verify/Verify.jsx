// import React from 'react'
// import './Verify.css'
// import { useSearchParams } from 'react-router-dom'
// const Verify = () => {

//     const [searchParams,setSearchParams] = useSearchParams();
//     const success = searchParams.get("success")
//     const orderId = searchParams.get("orderId")

//     console.log(success,orderId);

//   return (
//     <div>
      
//     </div>
//   )
// }

// export default Verify


import React, { useEffect } from 'react';
import './Verify.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId'); // This is the MongoDB _id
  const navigate = useNavigate();

  useEffect(() => {
    const verifyOrder = async () => {
      try {
        const response = await axios.post('http://localhost:4000/api/order/verify', {
          orderId,
          success,
        });
        if (response.data.success) {
          alert('Payment successful!');
          navigate('/'); // Redirect to home or orders page
        } else {
          alert('Payment failed. Please try again.');
          navigate('/cart'); // Redirect to cart page
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        alert('An error occurred while verifying the payment.');
        navigate('/cart'); // Redirect to cart page
      }
    };

    if (orderId && success !== null) {
      verifyOrder();
    }
  }, [orderId, success, navigate]);

  return (
    <div className="verify">
      <h1>Verifying Payment...</h1>
      <p>Please wait while we verify your payment.</p>
    </div>
  );
};

export default Verify;