const router = require("express").Router();
const ordersController = require("../controllers/orders.controller")
const { checkToken } = require("../auth/tokenValidation")

router.post("/checkout_session", checkToken, ordersController.checkoutSession);

router.post("/webhook",  ordersController.webhook);

module.exports = router;
