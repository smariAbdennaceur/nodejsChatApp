const Post = require('../models/post.model');
const User = require('../models/user.model')
const extend = require('lodash/extend');
const errorHandler = require('./../helpers/dbErrorHandler');
const formidable = require('formidable');
const fs = require('fs');
var Module = require('module');

Module._extensions['.png'] = function (module, fn) {
    var base64 = fs.readFileSync(fn).toString('base64');
    module._compile('module.exports="data:image/jpg;base64,' + base64 + '"', fn);
};

const create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.multiples= true
    form.keepExtensions = true
    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(400).json({
                message: "Image could not be uploaded"
            })
        }
         let post = new Post(fields)
        post.owner = req.profile
        let filePoste = [];
        if (files && Object.keys(files).length !== 0) {
            Object.entries(files).forEach((elemFile)=>{
                filePoste.push({
                    data: fs.readFileSync(elemFile[1].path),
                    contentType : elemFile[1].type
                })
            })
            post.image= filePoste;
            post.v=true
        }
        else{post.v=false}
        post.owner = req.profile
        try {
            let result = await post.save()
            res.status(200).json(result)
        } catch (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        } 
    })
}

const postByID = async (req, res, next, id) => {
    try {

        let post = await Post.findById(id).populate('owner', '_id firstName').exec()
        if (!post)
            return res.status('400').json({
                error: "Post not found"
            })
        req.post = post
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve post"
        })
    }
}




const read = (req, res) => {
    req.post.image = undefined
    return res.json(req.post)
}

const incSharePost = async (req, res) => {
  let idPost = req.params.postId;
  try {
    let post = await Post.findById(idPost);
    post.nbshare = post.nbshare + 1;

    let result = await Post.findByIdAndUpdate(req.params.postId, post);
    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const update = async (req, res) => {
    let form = new formidable.IncomingForm()

    form.keepExtensions = true
    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(400).json({
                message: "Image could not be uploaded"
            })
        }
        let post = await Post.findById(req.params.postId)
        newPost = extend(post, fields)
        if (files.image) {
            post.image.data = fs.readFileSync(files.image.path)
            post.image.contentType = files.image.type
        }

        try {
            let result = await Post.findByIdAndUpdate(req.params.postId, newPost)
            res.json(result)
        }
        catch (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
    })
}

const remove = async (req, res) => {
    try {
        let post = req.post
        let deletedPost = post.remove()
        res.status(200).json({
            success:
                "deleted successfully"
        })
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

const list = async (req, res) => {

    let posts = await Post.find().select('_id description like nbshare created_at comments owner v').populate('owner','_id firstName').exec();
       res.status(200).json({
        posts: posts.reverse()
        })

}

const listByOwner = async (req, res) => {
    try {
        let posts = await Post.find({ owner: req.profile._id }).select('_id description like nbshare created_at comments owner v').populate('owner','_id firstName').exec();
        res.json(posts.reverse())
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}


const addlike = async (req, res) => {
    try {
        let isLiker = true
        let post = await Post.findById(req.params.postId);
        post.like.userslike.forEach(U => {
            if (U.userid.equals(req.profile._id)) { isLiker = false }
        })
        if (isLiker) {
            post.like.nblike = post.like.nblike + 1;
            post.like.userslike.push({ "userid": req.profile });
            const postt = await Post.findByIdAndUpdate(req.params.postId, post);
            res.json({ like: isLiker });
        } else { res.json({ like: isLiker }) }

    } catch (err) {
        return res.status(400).json({
            err: "err"
        })
    }
};
const rmlike = async (req, res) => {
    try {
        let post = await Post.findById(req.params.postId);
        let i = 0;
        post.like.userslike.forEach(p => {
            if (p.userid.equals(req.profile._id)) {
                post.like.userslike.splice(i, 1);
                post.like.nblike = post.like.nblike - 1;
            }
            i = i + 1;
        })
        const postt = await Post.findByIdAndUpdate(req.params.postId, post);

        res.json({
            updated: "succes"
        });
    } catch (err) {
        return res.status(400).json({
            updated: "err"
        })
    }
};
const photo = (req, res, next) => {
    if (req.post.image) {
        return res.send(req.post.image)
    }
    next()
}
const addComment = async (req, res) => {
    try {
        let coms = []
        let p = await Post.findById(req.params.postId);
        coms = p.comments;
        let user = await User.findById(req.body.idUser);
        req.body.nameUser = user.firstName
        coms.push(req.body);
        p.comments = coms
        const post = await Post.findByIdAndUpdate(req.params.postId, p)
        res.status(200).json({
            success: 'Comment added successfully',
            data: post
        })
    } catch (err) {
        return res.status(400).json({
            comment: "err"
        })
    }
}
const getComments = async (req, res) => {
    try {
        let coms = []
        let p = await Post.findById(req.params.postId);
        coms = p.comments;
        res.status(200).json({
            data: coms
        })
    } catch (err) {
        return res.status(400).json({
            comment: "err"
        })
    }
}
module.exports = {
  create,
  postByID,
  list,
  listByOwner,
  read,
  update,
  remove,
  addlike,
  rmlike,
  photo,
  addComment,
  getComments,
  incSharePost,
};
