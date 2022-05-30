const Category = require('../models/category.model')
const formidable = require('formidable')
const create = async (req, res) => {
    try {
      let category = new Category(req.body)
      let result = await category.save()
      res.status(200).json(result)
    } catch (err){
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }

  const list = async (req, res) => {
    try {
      let categories = await Category.find()
      res.json(categories)
    } catch (err) {
      return res.status(400).json({
        error: "err"
      })
    }
  }

  const categoryByID = async (req, res, next, id) => {
    try {
      let category = await Category.findById(id).populate('category', '_id title').exec()
      if (!category)
        return res.status('400').json({
          error: "category not found"
        })
      req.category = category
      next()
    } catch (err) {
      return res.status('400').json({
        error: "Could not retrieve category"
      })
    }
  }


module.exports={
  create,
  list,
  categoryByID
}