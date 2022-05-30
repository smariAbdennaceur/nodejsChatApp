const config = require('./../config/config');
const User = require('../models/user.model');
const Card = require('../models/card.model');

const stripe = require("stripe")(config.stripe_test_secret_key)

const extend = require('lodash/extend');
const errorHandler = require('./../helpers/dbErrorHandler');
const request = require('request');
const formidable = require('formidable')
const fs = require('fs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
var Module = require('module');
Module._extensions['.png'] = function (module, fn) {
  var base64 = fs.readFileSync(fn).toString('base64');
  module._compile('module.exports="data:image/jpg;base64,' + base64 + '"', fn);
};

const create = (req, res) => {
  let form = new formidable.IncomingForm()

  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Image could not be uploaded"
      })
    }
    let user = new User(fields)
    if (files.profilePicture) {
      user.profilePicture.data = fs.readFileSync(files.profilePicture.path)
      user.profilePicture.contentType = files.profilePicture.type
    } else if (!files.profilePicture) {
      user.profilePicture.data = fs.readFileSync('images/default.png')
      user.profilePicture.contentType = user.profilePicture.type
    }

    if (files.coverPicture) {
      user.coverPicture.data = fs.readFileSync(files.coverPicture.path)
      user.coverPicture.contentType = files.coverPicture.type
    } else if (!files.coverPicture) {
      user.coverPicture.data = fs.readFileSync('images/default.png')
      user.coverPicture.contentType = user.coverPicture.type
    }
    try {
      let result = await user.save()
      res.status(200).json(result)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

/**
 * Load user and append to req.
 */
const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)
    if (!user)
      return res.status('400').json({
        error: "User not found"
      })
    req.profile = user
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve user"
    })
  }
}


const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  if(req.profile.stripe_customer === undefined){
    req.profile.stripe_customer = null
  }
  return res.json(req.profile)
}

const list = async (req, res) => {
  try {
    let users = await User.find().select('firstName lastName email updated created')
    res.json(users)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  let form = new formidable.IncomingForm()

  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Image could not be uploaded"
      })
    }
    let user = await User.findById(req.params.userId)
    newuser = extend(user, fields)
    if (files.profilePicture) {
      newuser.profilePicture.data = fs.readFileSync(files.profilePicture.path)
      newuser.profilePicture.contentType = files.profilePicture.type
    }
    if (files.coverPicture) {
      newuser.coverPicture.data = fs.readFileSync(files.coverPicture.path)
      newuser.coverPicture.contentType = files.coverPicture.type
    }
    newuser.updated = Date.now()

    try {
      if (user.encryptPassword(fields.password) == user.hashed_password) {
        let result = await User.findByIdAndUpdate(user._id, newuser)
        user.hashed_password = undefined
        user.salt = undefined
        res.json(result)
      }
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

const remove = async (req, res) => {
  try {
    let user = req.profile
    let deletedUser = await user.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const isSeller = (req, res, next) => {
  const isSeller = req.profile && req.profile.seller
  if (!isSeller) {
    return res.status('403').json({
      error: "User is not a seller"
    })
  }
  next()
}
const isVerified = (req, res, next) => {
  const isVerified = req.profile && req.profile.verified
  if (!isVerified) {
    return res.status('403').json({
      error: "User is not a seller"
    })
  }
  next()
}

const verificationMail = async (req, res) => {
  const rStr = uuidv4()
  ////mailing
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    auth: {
      user: config.email,
      pass: config.pwe,
    },
    secure: false,
  });
  let mailOptions = {
    from: config.email,
    to: req.body.email,
    subject: "Confirmation Mail",
    html: "Hello " + req.body.firstName + "!<br> In order to have the best customer experience and access every possible feature brought to you by TRADR, we highly recommend verifying your account. Doing so will greatly reinforce your account’s security and will heighten our confidence towards your intentions as a user. <br> In order to activate the above-mentioned advantages, click on the following link to verify your account: " + config.url + "/api/verify/" + rStr + "<br> <br> Best regards, <br> TRADR Inc.<br> TRADRcustomerservice@gmail.com <br> Privacy policy and TOS : www.wetradr.com/TOS<br>"
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    }

    res.status(200).send({ message: "mail send" });
  });

  let user = await User.findOneAndUpdate({ "email": req.body.email }, { "code": rStr });
  let result = await user.save();


};
const cheking = async (req, res) => {
  let user = await User.find({ "code": req.params.code })
  if (!user) {
    return res.status('300').json({
      err: "User not found"
    })
  } else {
    let verifiedUser = await User.findOneAndUpdate({ "code": req.params.code }, { "code": "", "verified": true });
    return res.redirect("https://test.tradr.wijaa-technologies.com/login");

  }

}

const accesRestPw = async (req, res) => {
  const rStr = uuidv4()
  let user = await User.findOneAndUpdate({ "email": req.body.email }, { "code": rStr });
  ////mailing
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    auth: {
      user: config.email,
      pass: config.pwe,
    },
    secure: false,
  });
  let mailOptions = {
    from: config.email,
    to: req.body.email,
    subject: "Reset password",
    html: "Hello " + user.firstName + "!<br>    It seems that you have forgotten your TRADR password and can no longer access <br> <br>Here is a link that will grant you the ability to reset your password: " + config.url + "/reset-password/?code=" + rStr + "<br> <br>If you did not initiate this procedure, please contact us as soon as possible at : TRADRcustomerservice@gmail.com <br> <br> Best regards, <br>TRADR Inc. <br>TRADRcustomerservice@gmail.com <br>Privacy policy and TOS : www.wetradr.com/TOS "
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    }

    res.status(200).send({ message: "mail send" });
  });

  let result = await user.save();


};
const resetPw = async (req, res) => {
  let user = await User.findOne({ "code": req.query.code })
  if (!user) {
    return res.status('300').json({
      err: "User not found"
    })
  } else {
    const pw = user.encryptPassword(req.body.password);
    let newUser = await User.findOneAndUpdate({ "code": req.query.code }, { "hashed_password": pw, "code": "" });
    return res.status('200').json({
      succes: "User updated successfully",
      user: newUser
    })
  }

}
const editPw = async (req, res) => {
  let user = await User.findById(req.profile._id)
  const pw = user.encryptPassword(req.body.oldPassword);
  if (!user) {
    return res.status('300').json({
      err: "User not found"
    })
  } else if (pw != user.hashed_password) {
    return res.status('300').json({
      err: "Password incorrect"
    })
  }
  else {
    let newpw = user.encryptPassword(req.body.newPassword)
    let newUser = await User.findByIdAndUpdate(req.profile._id, { "hashed_password": newpw });
    return res.status('200').json({
      succes: "User updated successfully",
      user: newUser
    })
  }

}


const stripe_auth = (req, res, next) => {
  request({
    url: "https://connect.stripe.com/oauth/token",
    method: "POST",
    json: true,
    body: { client_secret: config.stripe_test_secret_key, code: req.body.stripe, grant_type: 'authorization_code' }
  }, (error, response, body) => {
    //update user
    if (body.error) {
      return res.status('400').json({
        error: body.error_description
      })
    }
    req.body.stripe_seller = body
    next()
  })
}

const stripeCustomer = (req, res, next) => {
  if (req.profile.stripe_customer) {
    //update stripe customer
    myStripe.customers.update(req.profile.stripe_customer, {
      source: req.body.token
    }, (err, customer) => {
      if (err) {
        return res.status(400).send({
          error: "Could not update charge details"
        })
      }
      req.body.order.payment_id = customer.id
      next()
    })
  } else {
    myStripe.customers.create({
      email: req.profile.email,
      source: req.body.token
    }).then((customer) => {
      User.update({ '_id': req.profile._id },
        { '$set': { 'stripe_customer': customer.id } },
        (err, order) => {
          if (err) {
            return res.status(400).send({
              error: errorHandler.getErrorMessage(err)
            })
          }
          req.body.order.payment_id = customer.id
          next()
        })
    })
  }
}
const createCharge = async (req, res, next) => {
  let { amount, id,cardId } = req.body;
  try {
    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: "CAD",
      description: "paid by " + req.profile.firstName + " " + req.profile.lastName,
      payment_method: id,
      confirm: true
    });
    await res.json({
      message: "payment reussi",
      succes: true,
    });
    if(cardId){
    const list=await Card.findById(cardId).select('_id buyers').populate('buyers','_id firstName lastName');
    const oldBuyers=list.buyers;
    await Card.findByIdAndUpdate(cardId,{buyers:[...oldBuyers,req.profile.id]})
    }
  }
  catch (error) {

    await res.json({
      message: "payment echoue",
      succes: false,
    })
   
  }
}
const photo = (req, res, next) => {
  if (req.profile.profilePicture.data) {
    res.set("Content-Type", req.profile.profilePicture.contentType)
    return res.send(req.profile.profilePicture.data)
  }
  next()
}
const getOneUser = async (req, res, next) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
}
const coverPhoto = (req, res, next) => {
  if (req.profile.coverPicture.data) {
    res.set("Content-Type", req.profile.coverPicture.contentType)
    return res.send(req.profile.coverPicture.data)
  }
  next()
}
const rate = async (req, res) => {
  let V = true
  for (let rate of req.profile.rating) {
    if (rate.idUser.equals(req.body.id)) { V = false }
  }
  if (V) {
    let obj = { "rate": req.profile.rate, "rating": req.profile.rating }
    obj.rating.push({ "rate": req.body.rate, "idUser": req.body.id })

    obj.rate = (Number(req.body.rate) + Number(req.profile.rate)) / 2
    let user = await User.findByIdAndUpdate(req.profile, obj)
    res.json(obj)
  }
  else { return res.json({ rate: "user already rate" }) }
}
const follow = async (req, res) => {
  let V = true
  for (let follow of req.profile.followers) {
    if (follow.idUser.equals(req.params.idF)) { V = false }
  }
  if (V) {
    let obj = { "nbfollow": req.profile.nbfollow + 1, "followers": req.profile.followers }
    obj.followers.push({ "idUser": req.params.idF })
    let user = await User.findByIdAndUpdate(req.profile, obj)
    res.json({ "obj": obj, "etat": false })
  }
  else {
    let obj = { "nbfollow": req.profile.nbfollow - 1, "followers": req.profile.followers }
    let i = 0;
    obj.followers.forEach(p => {
      if (p.idUser.equals(req.params.idF)) {
        obj.followers.splice(i, 1);
      }
      i = i + 1;
    })
    let user = await User.findByIdAndUpdate(req.profile, obj)
    res.json({ "obj": obj, "etat": true })

  }
}

module.exports = {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  isSeller,
  stripe_auth,
  stripeCustomer,
  createCharge,
  isVerified,
  verificationMail,
  cheking,
  accesRestPw,
  resetPw,
  editPw,
  photo,
  coverPhoto,
  rate,
  follow,
  getOneUser
}
