const Card = require('../models/card.model')
const Category = require('../models/category.model')
const Country = require('../models/country.model')
const formidable = require('formidable')
const fs = require('fs');
var Module = require('module');
const extend = require('lodash/extend');

Module._extensions['.png'] = function (module, fn) {
  var base64 = fs.readFileSync(fn).toString('base64');
  module._compile('module.exports="data:image/jpg;base64,' + base64 + '"', fn);
};
const defaultImage = require('./../images/default.png');
const { stubFalse } = require('lodash');
const { find } = require('../models/card.model');

const create = async (req, res, next) => {
  let form = new formidable.IncomingForm
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Image could not be uploaded"
      })
    }
    let card = new Card(fields)
    card.owner = req.profile

    let categoryById = await Category.findById(fields.selectedCategory)
    let countryById = await Country.findById(fields.selectedCountry)

    if (categoryById !== null) {
      card.category.title = categoryById.title
      card.category.description = categoryById.description
      card.category.categoryId = categoryById._id
    }

    if (countryById !== null) {
      card.country.title = countryById.title
      card.country.countryId = countryById._id
    }

    if (files.image) {
      card.image.data = fs.readFileSync(files.image.path)
      card.image.contentType = files.image.type
    }
    else if (!files.image) {
      card.image.data = fs.readFileSync('images/default.png')
      card.image.contentType = card.image.type
    }
    
    if (files.bckImage) {
      card.bckImage.data = fs.readFileSync(files.bckImage.path)
      card.bckImage.contentType = files.bckImage.type
    }
    else if (!files.bckImage) {
      card.bckImage.data = fs.readFileSync('images/default.png')
      card.bckImage.contentType = card.bckImage.type
    }
    try {
      let result = await card.save()
      res.json(result)
    }
    catch (err) {
      return res.status(400).json({
        error: err.message
      })
    }
  })
}

const getAllCards = async (req, res) => {

  try {
    let cards = await Card.find().select('_id title subtitle information updated created price priceShipping owner category country isSponsored likes').populate('owner', '_id firstName').exec()
    res.json(cards.reverse())
  } catch (err) {
    return res.status(400).json({
      error: err.message
    })
  }
}

const photo =  async (req, res, next) => {
  let card = await Card.findById(req.card._id).select('image').exec()
  if (card) {
    res.set("Content-Type", card.image.contentType)
    return res.send(card.image.data)
  }
  next()
}
const bckimage = async (req, res, next) => {
  let card = await Card.findById(req.card._id).select('bckImage').exec()
  if (card) {
    res.set("Content-Type", card.bckImage.contentType)
    return res.send(card.bckImage.data)
  }
  next()
}

const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd() + defaultImage)
}

const cardByID = async (req, res, next, id) => {
  try {
    let card = await Card.findById(id).select('_id title subtitle information updated created price priceShipping owner category country isSponsored likes').populate('owner', '_id firstName').exec()
    if (!card)
      return res.status('400').json({
        error: "Card not found"
      })
    req.card = card
    next()
  } catch (err) {
    return res.status('400').json({
      error: err.message
    })
  }
}

const cardByOwner = async (req, res) => {
  try {
    let card = await Card.find({ owner: req.profile._id }).select('_id title subtitle information updated created price priceShipping owner category country isSponsored likes').populate('owner', '_id firstName')
    res.json(card)
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
    let card = await Card.findById(req.params.cardId)
    newCard = extend(card, fields)
    let categoryById = await Category.findById(fields.selectedCategory)
    let countryById = await Country.findById(fields.selectedCountry)
    if (categoryById !== null) {
      newCard.category.title = categoryById.title
      newCard.category.description = categoryById.description
      newCard.category.categoryId = categoryById._id
    }

    if (countryById !== null) {
      newCard.country.title = countryById.title
      newCard.country.countryId = countryById._id
    }
    if (files.image) {
      card.image.data = fs.readFileSync(files.image.path)
      card.image.contentType = files.image.type
    }
    try {
      let result = await Card.findByIdAndUpdate(req.params.cardId, newCard)
      res.json(result)
    }
    catch (err) {
      return res.status(400).json({
        error: err.message
      })
    }
  })
}

const remove = async (req, res) => {
  try {
    let card = req.card
    let deletedCard = card.remove()
    res.status(200).json({
      success:
        "deleted successfully"
    })
  } catch (err) {
    return res.status(400).json({
      error: err.message
    })
  }
}
const addlike = async (req, res) => {

  let isLiker = true
  card = req.card
  card.likes.forEach(U => { 
    if (req.profile._id.equals(U.idUser)) { isLiker = false }
  })
  if (isLiker) {
    card.likes.push({ "idUser": req.profile._id });
    const cardL = await Card.findByIdAndUpdate(card._id, card);
    res.json({ like: isLiker });
  } else { res.json({ like: isLiker }) }

};
const rmlike = async (req, res) => {
  let card = req.card
  let i = 0;
  card.likes.forEach(p => {
    if (req.profile._id.equals(p.idUser)) {
      card.likes.splice(i, 1);
    }
    i = i + 1;
  })
  const cardrmL = await Card.findByIdAndUpdate(card._id, card);

  res.json({
    updated: "succes"
  });

};
const amount = async (req, res) => {
 let s=0;
  req.body.cart.forEach(U => { 
    s=s+(U.quantity*U.product.priceShipping)
  })
  if(s==req.body.amount){
    res.json({
      V: true
    });
  }else{res.json({
    V: false
  });}

};
module.exports = {
  create,
  getAllCards,
  photo,
  defaultPhoto,
  cardByID,
  cardByOwner,
  update,
  remove,
  rmlike,
  addlike,
  amount,
  bckimage
}