const Room = require("../models/room.model");
const User = require("../models/user.model");
const formidable = require("formidable");
const fs = require("fs");

const create = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Image could not be uploaded",
      });
    }
    let room = new Room(fields);
    room.brodcaster.idUser = fields.idUser;
    await User.findByIdAndUpdate(fields.idUser, { live: true });
    let user = await User.findById(fields.idUser);
    room.brodcaster.name = user.firstName + " " + user.lastName;
    room.brodcaster.rate = user.rate;
    room.likesRomm = [];
    let breaks = [];
    let breakItem = {
      dateBr: "",
      categoryBr: "",
      availableSpots: 0,
      pricePerSpot: 0,
      image: null,
    };
    await Object.entries(fields).forEach(([key, value]) => {
      let entrie = key.split("[")[0];
      let indexEntrie = key.split("[").pop().split("]")[0];
      if (entrie !== undefined && breakItem[entrie] !== undefined) {
        if (breaks[indexEntrie] === undefined) {
          breakItem = {
            dateBr: "",
            categoryBr: "",
            availableSpots: 0,
            pricePerSpot: 0,
          };
          breaks.push(breakItem);
        }
        breakItem[entrie] = value;
      }
    });

    await Object.entries(files).forEach(([key, value]) => {
      let indexEntrie = key.split("[").pop().split("]")[0];
      breaks[indexEntrie].image = {
        data: fs.readFileSync(value.path),
        contentType: value.type,
      };
    });
    room.breaks = breaks;

    try {
      let result = await room.save();
      res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err),
      });
    }
  });
};

const addMsg = async (req, res) => {
  try {
    let msgs = [];
    let p = await Room.findById(req.params.room);
    msgs = p.message;
    let user = await User.findById(req.body.idUser);
    msgs.push({
      msg: req.body.msg,
      idUser: req.body.idUser,
      name: user.firstName,
    });
    p.message = msgs;
    const room = await Room.findByIdAndUpdate(req.params.room, p, {
      new: true,
    });
    res.status(200).json({
      success: "message added successfully",
      data: room.message,
    });
  } catch (err) {
    return res.status(400).json({
      comment: "err",
    });
  }
};
const getMsgByRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.room);

    res.status(200).json({
      success: "message added successfully",
      data: room.message,
    });
  } catch (err) {
    return res.status(400).json({
      comment: "err",
    });
  }
};
const getRoomById = async (req, res) => {
  try {
    let room = req.room;
    let roomm = await Room.findById(req.params.room);
    if (!room)
      return res.status("400").json({
        error: "room not found",
      });
    else {
      return res.status("200").json(roomm);
    }
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve room",
    });
  }
};
const roomByID = async (req, res, next, id) => {
  try {
    let room = await Room.findById(id)
      .select("_id title brodcaster category etat breaks message")
      .exec();
    if (!room)
      return res.status("400").json({
        error: "room not found",
      });
    req.room = room;
    next();
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve room",
    });
  }
};
const stopLive = async (req, res) => {
  try {
    let room = req.room;
    if (!room)
      return res.status("400").json({
        error: "room not found",
      });
    else {
      await Room.findByIdAndUpdate(room._id, { etat: false });
      return res.status("201").json({
        success: "room Stoped succesfully",
      });
    }
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve room",
    });
  }
};

const details = async (req, res) => {
  try {
    let room = req.room;
    let roomm = await Room.findById(req.params.room);
    let user = await User.findById(roomm.brodcaster.idUser)
      .select("_id followers")
      .populate("followers.idUser")
      .exec();
    let resul = { roomm, user };
    if (!room)
      return res.status("400").json({
        error: "room not found",
      });
    else {
      return res.status("200").json(resul);
    }
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve room",
    });
  }
};

const addlike = async (req, res) => {
  let isLiker = true;
  let room = await Room.findById(req.room._id);
  let user = await User.findById(req.params.userId);
  room.likesRomm.forEach((U) => {
    if (user._id.equals(U.idUser)) {
      isLiker = false;
    }
  });
  let index = room.likesRomm.findIndex((U) => user._id.equals(U.idUser));
  if (isLiker) {
    room.likesRomm.push({ idUser: user._id });
    const roomL = await Room.findByIdAndUpdate(room._id, room);
    res.json({ like: isLiker });
  } else {
    room.likesRomm.splice(index, 1);
    const roomL = await Room.findByIdAndUpdate(room._id, room);
    res.json({ like: isLiker });
  }
};

const getRooms = async (req, res) => {
  try {
    let room = await Room.find({ etat: true });

    res.status(200).json({
      rooms: room,
    });
  } catch (err) {
    return res.status(400).json({
      comment: "err",
    });
  }
};
const photo = async (req, res, next) => {
  let room = await Room.findById(req.room._id);
  if (room) {
    //   res.set("Content-Type", room.image.contentType)
    return res.send(room);
  }

  next();
};
const photoOfBreak = async (req, res, next) => { 
  let room = await Room.findById(req.room._id);
  if (room) {
    room.breaks.forEach((element) => {
      if (req.params.break === String(element._id ))  {
        res.set("Content-Type", element.image.contentType);
        return res.send(element.image.data);
      }
    });
  }

  next();
};

const banUser = async (req, res) => {
  try {
    let room = req.room;
    room.banned.push(req.params.iduser);
    let result = await Room.findOneAndUpdate(room._id, room);
    res.status(200).json({
      room: result,
    });
  } catch (err) {
    return res.status(400).json({
      comment: "err",
    });
  }
};
const isBanned = async (req, res) => {
  let banned = false;
  room = req.room;
  room.banned.forEach((U) => {
    if (req.params.iduser == U) {
      banned = true;
    }
  });
  res.json(banned);
};
const recomList = async (req, res) => {
  let users = await User.find().select("_id firstName  lastName live");

  try {
    let reslt = users.sort((a, b) =>
      a.rate > b.rate ? -1 : b.rate > a.rate ? 1 : 0
    );
    res.json(reslt);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  create,
  addMsg,
  getMsgByRoom,
  roomByID,
  getRooms,
  photo,
  banUser,
  isBanned,
  stopLive,
  recomList,
  getRoomById,
  details,
  addlike,
  photoOfBreak,
};
