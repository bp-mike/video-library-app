const router = require("express").Router();
const ordersController = require("../controllers/orders.controller")
const { checkToken } = require("../auth/tokenValidation")

router.get("/my-orders/:user_id", ordersController.myOrders);

router.get("/", ordersController.getAllOrders);

router.get("/:id", ordersController.getOneOrder);

router.post("/", ordersController.createOrder); //TODO fix

router.patch("/:id", ordersController.updateOrder); //TODO Test

router.delete("/:id", ordersController.deleteOrder);

router.post("/checkout_session", checkToken, ordersController.checkoutSession);

router.post("/webhook",  ordersController.webhook);

module.exports = router;
