const Auction = require('../models/auction.model');
const config = require("../config/config")
const User = require('../models/user.model')
const Category = require('../models/category.model')
const nodemailer = require('nodemailer');
var schedule = require('node-schedule');
const extend = require('lodash/extend');
const errorHandler = require('../helpers/dbErrorHandler');
const formidable = require('formidable');
const fs = require('fs');
var Module = require('module');
Module._extensions['.png'] = function (module, fn) {
  var base64 = fs.readFileSync(fn).toString('base64');
  module._compile('module.exports="data:image/jpg;base64,' + base64 + '"', fn);
};

const defaultImage = require('../images/default.png')

const create = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Image could not be uploaded"
      })
    }
    let auction = new Auction(fields)
    if (auction.safetyPrice && auction.safetyPrice > 0) {
      if (auction.safetyPrice <= auction.startingBid) {
        res.status(400).json({
          message: "safety price must be greater than starting bid",
        });
      }
    }
    auction.seller = req.profile
    auction.shipping_Price = fields.shipping_Price
    auction.isSponsored = fields.isSponsored
    let categoryById = await Category.findById(fields.selectedCategory)

    if (categoryById !== null) {
      auction.category.title = categoryById.title
      auction.category.description = categoryById.description
      auction.category.categoryId = categoryById._id
    }
    if (files.image) {
      auction.image.data = fs.readFileSync(files.image.path)
      auction.image.contentType = files.image.type
    } else if (!files.image) {
      auction.image.data = fs.readFileSync('images/default.png')
      auction.image.contentType = auction.image.type
    }
    if (files.bckImage) {
      auction.bckImage.data = fs.readFileSync(files.bckImage.path)
      auction.bckImage.contentType = files.bckImage.type
    }
    else if (!files.bckImage) {
      auction.bckImage.data = fs.readFileSync('images/default.png')
      auction.bckImage.contentType = auction.bckImage.type
    }
    try {
      let result = await auction.save()
      let alertDate= new Date(result.bidEnd);
      alertDate.setMinutes(alertDate.getMinutes() - 10);
     schedule.scheduleJob(alertDate, async function(){
      let auction = await Auction.findById(result._id)
      let user = await User.findById(auction.bids[0].bidder)
              //mailling******************befor 10 min of ending ****************
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
                to: user.email,
                subject: "10 min before expiring",
                html: "Hi "+ user.firstName+"!<br> The following auction in which you are the highest bidder is ending in 10 minutes <br>  You probably want to check it out in case someone beats your bid at the last minute! <br> <br>  Best wishes, <br> TRADR Inc.<br> TRADRcustomerservice@gmail.com <br> Privacy policy and TOS : www.wetradr.com/TOS<br>"
                            };
            
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log(err);
                }
                    });
              //mailling**********************************
    
    
    });
    schedule.scheduleJob(result.bidEnd, async function(){
      let auction = await Auction.findByIdAndUpdate(result._id,{ended:true})
      let user = await User.findById(auction.bids[0].bidder)
              //mailling******************sending to winner ****************
              if(auction.safetyPrice<=auction.bids[0].bid){
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
                to: user.email,
                subject: "You win the bid "+auction.title,
                html: "Hi "+ user.firstName+"!<br> We are glad to announce that you have one the following auction:  <span style='font-weight:bold;font-weight:700;'>"+auction.title+"</span> <br>  Please log in to claim your new card by using this link :"+config.url+"/login <br> <br> Best regards, <br> TRADR Inc.<br> TRADRcustomerservice@gmail.com <br> Privacy policy and TOS : www.wetradr.com/TOS<br>"
                            };
            
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log(err);
                }
                    });}
              //mailling**********************************
    
    
    });
      res.status(200).json(result)
    } catch (err) {
      return res.status(400).json({
        error: err
      })
    }
  })
}

const auctionByID = async (req, res, next, id) => {
  try {
    let auction = await Auction.findById(id).select('_id title subtitle information updated created bidStart bidEnd ended category isSponsored seller likes startingBid safetyPrice bids').populate('seller', '_id firstName').populate('bids.bidder', '_id firstName').exec()
    if (!auction)
      return res.status('400').json({
        error: "Auction not found"
      })
    req.auction = auction
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve auction"
    })
  }
}
const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd() + defaultImage)
}
const photo = async (req, res, next) => {
  let auction = await Auction.findById(req.auction._id).select('image').exec()

  if (auction) {
    res.set("Content-Type", auction.image.contentType)
    return res.send(auction.image.data)
  }
  next()
}
const bckimage = async (req, res, next) => {
  let auction = await Auction.findById(req.auction._id).select('bckImage').exec()
  if (auction) {
    res.set("Content-Type", auction.bckImage.contentType)
    return res.send(auction.bckImage.data)
  }
  next()
}

const read = async (req, res) => {
  req.auction.image = undefined
  let auction = await Auction.findById(req.auction._id).populate('seller', '_id firstName').populate('bids.bidder', '_id firstName')
  return res.json(auction)
}

const update = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Photo could not be uploaded"
      })
    }
    let auction = req.auction
    if (fields.safetyPrice && fields.safetyPrice > 0) {
      if (fields.safetyPrice <= fields.startingBid) {
        res.status(400).json({
          message: "safety price must be greater than starting bid",
        });
      }
    }
    auction = extend(auction, fields)
    auction.updated = Date.now()
    if (files.image) {
      auction.image.data = fs.readFileSync(files.image.path)
      auction.image.contentType = files.image.type
    }
    try {
      let result = await auction.save()
      res.json(result)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

const remove = async (req, res) => {
  try {
    let auction = req.auction
    let deletedAuction = auction.remove()
    res.json(deletedAuction)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listOpen = async (req, res) => {
  try {
    let auctions = await Auction.find({ 'bidEnd': { $gt: new Date() } }).sort('bidStart').populate('seller', '_id firstName').populate('bids.bidder', '_id firstName')
    res.json(auctions)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listOpenwithouImage = async (req, res) => {
  try {
    let auctions = await Auction.find({ 'bidEnd': { $gt: new Date() } }).sort('bidStart').populate('seller', '_id firstName').populate('bids.bidder', '_id firstName').select('title')
    res.json(auctions)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listBySeller = async (req, res) => {
  try {
    let auctions = await Auction.find({ seller: req.profile._id }).populate('seller', '_id firstName').populate('bids.bidder', '_id firstName')
    res.json(auctions)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}
const listByBidder = async (req, res) => {
  try {
    let auctions = await Auction.find({ 'bids.bidder': req.profile._id }).populate('seller', '_id firstName').populate('bids.bidder', '_id firstName')
    res.json(auctions)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const isSeller = (req, res, next) => {
  const isSeller = req.auction && req.auth && req.auction.seller._id == req.auth._id
  if (!isSeller) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

module.exports = {
  create,
  auctionByID,
  photo,
  listOpen,
  listOpenwithouImage,
  listBySeller,
  listByBidder,
  read,
  update,
  isSeller,
  remove,
  bckimage,
  defaultPhoto
}
