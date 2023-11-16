const jwt = require("jsonwebtoken");

const checkToken =  (req, res, next) => {
  let token = req.get("authorization");
  if (token) {
    // remove bearer from string
    token = token.slice(7);
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Invalid Token",
          // error: err, 
          // token,
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Access Denied! Unauthorized User",
    });
  }
};

module.exports = {
  checkToken,
};
