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

const myOrders = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { page, pageSize } = req.query;
    const pageInt = parseInt(page) || 1;
    const pageSizeInt = parseInt(pageSize) || 10;
    const skip = (pageInt - 1) * pageSizeInt;

    const where = {
      userId: +user_id,
    };

    const orders = await prisma.order.findMany({
      where,
      skip,
      take: pageSizeInt,
      include: {
        movies: true,
        User: true
      },
    });

    const totalOrders = await prisma.order.count({ where });

    // Extract movieIds from orders
    const movieIds = orders.map((order) => order.movieId);

    // Fetch movies separately using the movieIds
    const movies = await prisma.movie.findMany({
      where: {
        id: {
          in: movieIds,
        },
      },
    });

    // Combine orders and movies based on movieId
    const formattedOrders = orders.map((order) => {
      // const movie = movies.find((m) => m.id === order.movieId);
      return {
        OrderNumber: order.OrderNumber,
        userId: order.userId,
        userName: order.User.userName,
        userEmail: order.User.email,
        userPhone: "0700 000 000", // TODO update scheme with user Phone
        movieId: order.movieId,
        createdAt: order.createdAt,
        orderStatus: "Processing", // TODO update scheme with default Processing order status
        // movie: {
        //   movieId: movie.id,
        //   movieTitle: movie.title,
        //   moviePrice: movie.price,
        // },
        movies: movies.map((movie) => ({ //TODO do this right
          movieId: movie.id,
          movieTitle: movie.title,
          moviePrice: movie.price,
          movieImageUrl: movie.image,
        })),
      };
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Orders Fetched Successfully",
      orders: formattedOrders,
      totalOrders,
      page: pageInt,
      pageSize: pageSizeInt,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const pageInt = parseInt(page, 10);
    const pageSizeInt = parseInt(pageSize, 10);
    const skip = (pageInt - 1) * pageSizeInt;

    const orders = await prisma.order.findMany({
      skip,
      take: pageSizeInt,
      include: {
        movies: true,
        User: true,
      },
    });

    const totalOrders = await prisma.order.count({});

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Orders Fetched Successfully",
      orders: orders,
      totalOrders,
      page: pageInt,
      pageSize: pageSizeInt,
    });
  } catch (error) {
    next(error);
  }
};

const getOneOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: {
        OrderNumber: +id,
      },
      include: {
        movies: true,
        User: true,
      },
    });
    if (!order) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Order does not exist",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      order: {...order, status: "processing"},
      message: "Order Fetched Successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingOrder = await prisma.order.findUnique({
      where: {
        OrderNumber: +id,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Order not found",
      });
    }

    // Update the order in the database
    const updatedOrder = await prisma.order.update({
      where: {
        OrderNumber: +id,
      },
      data: req.body,
      include: {
        movies: true,
        User: true,
      },
    });

    return res.status(200).json({
      status: 200,
      success: true,
      order: updatedOrder,
      message: "Order Updated Successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingOrder = await prisma.order.findUnique({
      where: {
        OrderNumber: +id,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Order not found",
      });
    }

    // Delete the order from the database
    const deletedOrder = await prisma.order.delete({
      where: {
        OrderNumber: +id,
      },
      include: {
        movies: true,
        User: true,
      },
    });

    return res.status(200).json({
      status: 200,
      success: true,
      order: deletedOrder,
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { userId, movieIds } = req.body;

    // Check if the user and movies exist
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    const existingMovies = await prisma.movie.findMany({
      where: {
        id: {
          in: movieIds,
        },
      },
    });

    if (existingMovies.length !== movieIds.length) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "One or more movies not found",
      });
    }

    // Create the order in the database
    const newOrder = await prisma.order.create({
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
        movies: {
          connect: movieIds.map((movieId) => ({ id: movieId })),
        },
      },
      include: {
        movies: true,
        User: true,
      },
    });

    return res.status(201).json({
      status: 201,
      success: true,
      order: newOrder,
      message: "Order Created Successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  checkoutSession,
  webhook,
  myOrders,
  getAllOrders,
  getOneOrder,
  updateOrder,
  deleteOrder,
  createOrder,
};


// const getAllOrders = async (req, res, next) => {
//   try {
//     const { page, pageSize } = req.query;
//     const pageInt = parseInt(page) || 1;
//     const pageSizeInt = parseInt(pageSize) || 10;
//     const skip = (pageInt - 1) * pageSizeInt;

//     const where = {};

//     const orders = await prisma.order.findMany({
//       where,
//       skip,
//       take: pageSizeInt,
//       include: {
//         movies: true,
//         User: true
//       },
//     });

//     const totalOrders = await prisma.order.count({ where });

//     // Extract movieIds from orders
//     const movieIds = orders.map((order) => order.movieId);

//     // Fetch movies separately using the movieIds
//     const movies = await prisma.movie.findMany({
//       where: {
//         id: {
//           in: movieIds,
//         },
//       },
//     });

//     // Combine orders and movies based on movieId
//     const formattedOrders = orders.map((order) => {
//       // const movie = movies.find((m) => m.id === order.movieId);
//       return {
//         OrderNumber: order.OrderNumber,
//         userId: order.userId,
//         userName: order.User.userName,
//         userEmail: order.User.email,
//         userPhone: "0700 000 000", 
//         movieId: order.movieId,
//         createdAt: order.createdAt,
//         orderStatus: "Processing", 
//         // movie: {
//         //   movieId: movie.id,
//         //   movieTitle: movie.title,
//         //   moviePrice: movie.price,
//         // },
//         movies: movies.map((movie) => ({ 
//           movieTitle: movie.title,
//           moviePrice: movie.price,
//           movieImageUrl: movie.image,
//         })),
//       };
//     });

//     return res.status(200).json({
//       status: 200,
//       success: true,
//       message: "Orders Fetched Successfully",
//       orders: formattedOrders,
//       totalOrders,
//       page: pageInt,
//       pageSize: pageSizeInt,
//     });
//   } catch (error) {
//     next(error);
//   }
// };



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