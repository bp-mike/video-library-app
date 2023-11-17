const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const getRawBody = require('raw-body');

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const checkoutSession = async (req, res, next) => {
  const body = req.body;
  const userId = req.decoded.id;
  const userEmail = req.decoded.email;

  const line_items = body?.items?.map((item) => {
    const productData = {
      name: item.title,
      metadata: { movieId: item.movie },
    };

    if (item.image) {
      productData.images = [item.image];
    }
    return {
      price_data: {
        currency: "usd",
        product_data: productData,
        unit_amount: item.price * 100,
      },
      quantity: 1, // Assuming quantity is always 1, adjust as needed
      tax_rates: ["txr_1ODNfqEWMOZiFav08lSNJyDD"],
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${process.env.ORDER_URL}/me/orders?order_success=true`,
    cancel_url: `${process.env.ORDER_URL}`,
    customer_email: userEmail,
    client_reference_id: userId,
    mode: "payment",
    line_items,
  });

  res.status(200).json({
    status: 200,
    success: true,
    url: session.url,
    message: "Checkout Session Successful",
  });
};

const getCartItems = async (line_items) => {
  return new Promise((resolve, reject) => {
    let cartItems = [];

    line_items?.data?.forEach(async (item) => {
      const movie = await stripe.products.retrieve(item.price.product);
      const movieId = movie.metadata.movieId;

      cartItems.push({
        movieId: movieId,
        title: movie.name,
        price: item.price.unit_amount_decimal / 100,
        image: movie.images[0],
      });

      if (cartItems.length === line_items?.data.length) {
        resolve(cartItems);
      }
    });
  });
}

const webhook = async (req, res) => {
  try {
    const rawBody = await getRawBody(req)
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const line_items = await stripe.checkout.sessions.listLineItems(
        event.data.object.id
      );
      
      const orderItems = await getCartItems(line_items);
      const userId = session.client_reference_id;
      const amountPaid = session.amount_total / 100;

      const paymentInfo = {
        id: session.payment_intent,
        status: session.payment_status,
        amountPaid,
        taxPaid: session.total_details.amount_tax / 100,
      };

      // const orderData = {
      //   movieId: +orderItems[0].movieId,
      //   userId: +userId,
      // };

      // // const orderData = {
      // //   user: { connect: { id: userId } }, // Connect to an existing user by ID
      // //   movies: {
      // //     connect: orderItems.map((item) => ({
      // //       id: item.movieId
      // //     })),
      // //   },
      // // };

      // const createdOrder = await prisma.order.create({
      //   data: orderData,
      //   // include: {
      //   //   movies: true,
      //   //   user: true,
      //   // },
      // });

      const orderDataArray = orderItems.map((orderItem) => ({
        movieId: +orderItem.movieId,
        userId: +userId,
      }));
      
      const createdOrders = await Promise.all(
        orderDataArray.map((orderData) =>
          prisma.order.create({
            data: orderData,
          })
        )
      );

      res.status(201).json({
        status: 201,
        success: true,
        data: createdOrders,
        message: "Order Saved Successfully",
      });

    }
  } catch (error) {
    console.log(error);
  }
};

// const webhook = async (req, res) => {
//   try {
//     const rawBody = req.rawBody.toString('utf-8'); 
//     const signature = req.headers["stripe-signature"];

//     const event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       const line_items = await stripe.checkout.sessions.listLineItems(
//         event.data.object.id
//       );
//       // console.log('Raw Body:', req.body.toString('utf-8'));
//       // console.log('Headers:', req.headers);
//       // console.log(line_items);

//       console.log('Raw Body:', rawBody);
//       console.log('Headers:', req.headers);
//      return 

//       const orderItems = await getCartItems(line_items);
//       const userId = session.client_reference_id;
//       const amountPaid = session.amount_total / 100;

//       const paymentInfo = {
//         id: session.payment_intent,
//         status: session.payment_status,
//         amountPaid,
//         taxPaid: session.total_details.amount_tax / 100,
//       };

//       const orderData = {
//         user: userId,
//         paymentInfo,
//         orderItems,
//       };

//       // const order = await Order.create(orderData);
//       // res.status(201).json({ success: true });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// const webhook = async (req, res) => {
//   try {
//     const rawBody = await getRawBody(req);
//     const signature = req.headers["stripe-signature"];

//     const event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       const line_items = await stripe.checkout.sessions.listLineItems(
//         event.data.object.id
//       );

//      return  console.log(line_items);

//       const orderItems = await getCartItems(line_items);
//       const userId = session.client_reference_id;
//       const amountPaid = session.amount_total / 100;

//       const paymentInfo = {
//         id: session.payment_intent,
//         status: session.payment_status,
//         amountPaid,
//         taxPaid: session.total_details.amount_tax / 100,
//       };

//       const orderData = {
//         userId,
//         paymentInfo,
//         movies: orderItems.map((item) => ({
//           title: item.name,
//           price: item.price,
//           quantity: item.quantity,
//           image: item.image,
//         })),
//       };

//       // Create order using Prisma
//       const createdOrder = await prisma.order.create({
//         data: orderData,
//       });

//       console.log("Order created:", createdOrder);
//     }
//     res.status(200).send();
//   } catch (error) {
//     console.error("Error processing webhook:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

module.exports = {
  checkoutSession,
  webhook,
};
