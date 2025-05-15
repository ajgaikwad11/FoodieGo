// import React, { useContext, useState } from 'react'
// import './PlaceOrder.css'
// import { StoreContext } from '../../context/StoreContext'
// import axios from "axios"

// const PlaceOrder = () => {

//   const {getTotalCartAmount,token,food_list,cartItems,url} = useContext(StoreContext);

//   const [data,setData] = useState({
//     firstName:"",
//     lastName:"",
//     email:"",
//     street:"",
//     city:"",
//     state:"",
//     zipcode:"",
//     country:"",
//     phone:""
//   })

//   const onChangeHandler = (event) => {
//     const name = event.target.name;
//     const value = event.target.value;
//     setData(data=>({...data,[name]:value}))
//   }

//   const placeOrder = async (event) => {
//     event.preventDefault();
//     let orderItems = [];
//     food_list.map((item)=>{
//       if(cartItems[item._id]>0) {
//         let itemInfo = item;
//         itemInfo["quantity"] = cartItems[item._id];
//         orderItems.push(itemInfo);
//       }
//     })
//     let orderData = {
//       address:data,
//       item:orderItems,
//       amount:getTotalCartAmount()+2,
//     }
//     let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}})
//     if(response.data.success) {
//       const {session_url} = response.data;
//       window.location.replace(session_url);
//     }
//     else{
//       alert("Error");
//     }
//   }

//   return (
//     <form onSubmit={placeOrder} className='place-order'>
//     <div className='place-order-left'>
//       <p className="title">Delivery Information</p>
//       <div className="multi-fields">
//         <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
//         <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
//       </div>
//       <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
//       <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
//       <div className="multi-fields">
//         <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
//         <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
//       </div>
//       <div className="multi-fields">
//         <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
//         <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
//       </div>
//       <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
//     </div>
//     <div className="place-order-right">
//     <div className="cart-total">
//           <h2>Cart Totals</h2>
//           <div>
//             <div className="cart-total-details">
//               <p>Subtotal</p>
//               <p>${getTotalCartAmount()}</p>
//             </div>
//             <hr />
//             <div className="cart-total-details">
//               <p>Delivery Fee</p>
//               <p>{getTotalCartAmount()===0?0:2}</p>
//             </div>
//             <hr />
//             <div className="cart-total-details">
//               <b>Total</b>
//               <b>${getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
//             </div>
//           </div>
//             <button type='submit'>PROCEED TO PAYMENT</button>
//         </div>
//     </div>
//     </form>
//   )
// }

// export default PlaceOrder

import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const handlePayment = async () => {
    const response = await axios.post('http://localhost:4000/api/order/place', orderData, {
      headers: { token },
    });

    if (response.data.success) {
      const options = {
        key: response.data.key,
        amount: response.data.amount,
        currency: response.data.currency,
        order_id: response.data.razorpayOrderId, // Use Razorpay order ID
        name: "Your Company Name",
        description: "Test Transaction",
        handler: function (response) {
          // Redirect to the verify route after payment
          window.location.href = `${frontend_url}/verify?success=true&orderId=${response.data.orderId}`;
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert("Please login first");
    }
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async (orderData) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: orderData.key, // Razorpay key from backend
      amount: orderData.amount, // Amount in paise
      currency: orderData.currency,
      name: "FoodieGo",
      description: "Test Transaction",
      order_id: orderData.orderId, // Razorpay order ID
      handler: async function (response) {
        // Handle payment success
        alert("Payment Successful!");
        // You can send the payment details to your backend for verification
        const paymentData = {
          orderId: orderData.orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        };
        await axios.post(url + "/api/order/verify", paymentData, {
          headers: { token },
        });
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone,
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };

    try {
      const response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });
      if (response.data.success) {
        const { orderId, amount, currency, key } = response.data;
        await displayRazorpay({ orderId, amount, currency, key });
      } else {
        alert("Please login first");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Please login first");
    }
  };

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email address"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder="Zip code"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder="Phone"
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;