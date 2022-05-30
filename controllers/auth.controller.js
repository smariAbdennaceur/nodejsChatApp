const User = require ('../models/user.model');
const config = require ('./../config/config');
const jwt = require ('jsonwebtoken');
const expressJwt = require ('express-jwt');
const signin = async (req, res) => {
  try {
    let user = await User.findOne({"email": req.body.email})

      if (!user)
        return res.status('401').json({
          error: "User not found"
        })

      if (!user.authenticate(req.body.password)) {
        return res.status('401').send({
          error: "Email and password don't match."
        })
      }

      const token = jwt.sign({
        _id: user._id
      }, config.jwtSecret)

      res.cookie("t", token, {
        expire: new Date() + 9999
      })

      return res.json({
        token,
        user: {_id: user._id, name: user.name, email: user.email, seller: user.seller}
      })
  } catch (err) {
    return res.status('401').json({
      error: "Could not sign in"
    })
  }
}

const signout = (req, res) => {
  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}

const requireSignin = expressJwt({
  secret: "YOUR_secret_key", /*static jwtsecret*/
  userProperty: 'auth'
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

module.exports = {
  signin,
  signout,
  requireSignin,
  hasAuthorization
}