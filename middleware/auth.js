const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("./errorResponse");

//protect Routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }
  //make sure token exists
  if (!token) {
    
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
  try {
    //varify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // console.log(decoded);

    req.uId =decoded.id;
    req.urole= decoded.role
    next();
  } catch (err) {
    console.log(err)
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});


// Grant access to specific roles

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.urole)) {
      return next(
        new ErrorResponse(
          `User role ${req.urole} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
