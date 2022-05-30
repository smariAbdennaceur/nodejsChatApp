const Razz = require('../models/razz.model')
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

const create = async (req, res, next) => {
    let form = new formidable.IncomingForm
    form.keepExtensions = true
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                message: "Image could not be uploaded"
            })
        }
        let razz = new Razz(fields)
        if (razz.availableSpots && razz.availableSpots < 2) {
          res.status(400).json({
            message: "must have a minimum of 2 available spots",
          });
        }
        razz.owner = req.profile

        let categoryById = await Category.findById(fields.selectedCategory)
       // let countryById = await Country.findById(fields.selectedCountry)

        if (categoryById !== null) {
            razz.category.title = categoryById.title
            razz.category.description = categoryById.description
            razz.category.categoryId = categoryById._id
        }

        // if (countryById !== null) {
        //   razz.country.title = countryById.title
        //   razz.country.countryId = countryById._id
        // }

        if (files.image) {
            razz.image.data = fs.readFileSync(files.image.path)
            razz.image.contentType = files.image.type
        }
        if (files.bimg) {
          razz.bimg.data = fs.readFileSync(files.bimg.path)
          razz.bimg.contentType = files.bimg.type
      }
        else if (!files.image) {
            razz.image.data = fs.readFileSync('images/default.png')
            razz.image.contentType = razz.image.type
        }
        try {
            let result = await razz.save()
            res.json(result)
        }
        catch (err) {
            return res.status(400).json({
                error: err.message
            })
        }
    })
}

const photo = (req, res, next) => {
    if (req.razz.image.data) {
        res.set("Content-Type", req.razz.image.contentType)
        return res.send(req.razz.image.data)
    }
    next()
}

const defaultPhoto = (req, res) => {
    return res.sendFile(process.cwd() + defaultImage)
}
const getWinner = (req, res) => {
    let i = Math.floor(Math.random() * 50)
    return res.send({ number: i })
}
const list = async (req, res) => {
    try {
        let razzs = await Razz.find()
          .select(
            "_id title  information country category availableSpots date pricePerSpot isSponsored condidats owner likes"
          )
          .sort({ "isSponsored": -1, "date": -1 })
          .populate("owner", "_id firstName")
          .exec();
        // razzs=razzs.sort((a, b) => (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0));
        // razzs.sort((a) => (a.isSponsored) ? -1 : ((!a.isSponsored) ? 1 : 0))
        res.json(razzs)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}
const razzById = async (req, res, next, id) => {
    try {
      let razz = await Razz.findById(id)
      if (!razz)
        return res.status('400').json({
          error: "Card Razz not found"
        })
      req.razz = razz
      next()
    } catch (err) {
      return res.status('404').json({
        error: "Could not retrieve user"
      })
    }
  }
  const JoinRazz = async (req, res) => {
      let razz= await Razz.findById(req.body.razzId)
      let razzCond = razz.condidats
      const razzCondL = razzCond.length
      const p = Number(req.body.spots)+Number(razzCondL)
      for (let i = razzCondL; i < p; i++) {
        razzCond.push(req.body.userId)
      } 
      try {
      razz.condidats=razzCond
      razz.availableSpots=Number(razz.availableSpots)-Number(req.body.spots)
            if(razz.availableSpots===0){
              let i = Math.floor(Math.random() * razz.condidats.length)
              razz.owner=razz.condidats[i]
             }

      let result = await Razz.findByIdAndUpdate(req.body.razzId,razz)
      return res.status('200').json({
        Success: "Condidat added successfully",
        razz: result
      })
    } catch (err) {
      return res.status('404').json({
        error: "Could not retrieve razz"
      })
    }
  }
  
const addlike = async (req, res) => {

  let isLiker = true
  razz = req.razz
  razz.likes.forEach(U => { 
    if (req.profile._id.equals(U.idUser)) { isLiker = false }
  })
  if (isLiker) {
    razz.likes.push({ "idUser": req.profile._id });
    const razzL = await Razz.findByIdAndUpdate(razz._id, razz);
    res.json({ like: isLiker });
  } else { res.json({ like: isLiker }) }

};
const rmlike = async (req, res) => {
  let razz = req.razz
  let i = 0;
  razz.likes.forEach(p => {
    if (req.profile._id.equals(p.idUser)) {
      razz.likes.splice(i, 1);
    }
    i = i + 1;
  })
  const razzmL = await Razz.findByIdAndUpdate(razz._id, razz);

  res.json({
    updated: "succes"
  });

};
  const amount = async (req, res) => {
  if((req.body.pricePerSpot*req.body.incrementNumber)&&(req.razz.pricePerSpot==req.body.pricePerSpot)){
    res.json({
      V: true
    });
  }else{res.json({
    V: false
  });}

};
module.exports = {
    create,
    photo,
    defaultPhoto,
    getWinner,
    list,
    razzById,
    JoinRazz,
    amount,
    addlike,
    rmlike
    
}