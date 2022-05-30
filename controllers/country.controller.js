const Country = require('../models/country.model')

const create = async (req, res) => {
    try {
      let country = new Country(req.body)
      let result = await country.save()
      res.status(200).json(result)
    } catch (err){
      return res.status(400).json({
        error: err.message
      })
    }
  }

  const list = async (req, res) => {
    try {
      let countries = await Country.find()
      res.json(countries)
    } catch (err) {
      return res.status(400).json({
        error: err.message
      })
    }
  }

  const countryByID = async (req, res, next, id) => {
    try {
      let country = await Country.findById(id).populate('country', '_id title').exec()
      if (!country)
        return res.status('400').json({
          error: "country not found"
        })
      req.country = country
      next()
    } catch (err) {
      return res.status('400').json({
        error: "Could not retrieve country"
      })
    }
  }


module.exports={
  create,
  list,
  countryByID
}