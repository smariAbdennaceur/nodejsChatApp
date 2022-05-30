const app = require("./express");
const fs = require("fs");
const http = require("http");
var https = require("https");
const nodemailer = require("nodemailer");
const Auction = require("./models/auction.model");
const User = require("./models/user.model");
const config = require("./config/config");

// var privateKey  = fs.readFileSync('/etc/letsencrypt/live/test.tradr.wijaa-technologies.com/privkey.pem', 'utf8');
// var certificate = fs.readFileSync('/etc/letsencrypt/live/test.tradr.wijaa-technologies.com/fullchain.pem', 'utf8');
// var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

const io = require("socket.io")(httpServer, {
  secure: true,
  cors: {
    origin: config.url,
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});
// Connection URL
const x = require("./helpers/initMongodb");

const roomRoutes = require("./routes/room.routes");
app.use("/", roomRoutes);

// Running the server
const port = 4000;
// const portHttps = 3000;
//*************************************streaming*****************************

let broadcasters = {};
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
io.on("connection", function (socket) {
  console.log("a user connected.");
  // when conn
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });

  socket.on("register as broadcaster", function (room) {
    console.log("register as broadcaster for room", room);
    broadcasters[room] = socket.id;
    console.log(socket.id);
    socket.join(room);
  });
  socket.on("register as viewer", function (user) {
    console.log("register as viewer for room", user.room);

    socket.join(user.room);
    socket.to(broadcasters[user.room]).emit("new viewer", socket.id);
  });

  socket.on("candidate", function (id, event) {
    console.log("ikram ");
    socket.to(id).emit("candidate", socket.id, event);
  });

  socket.on("offer", function (id, event) {
    event.broadcaster.id = socket.id;
    socket.to(id).emit("offer", event.broadcaster, event.sdp);
  });

  socket.on("answer", function (event) {
    socket.to(broadcasters[event.room]).emit("answer", socket.id, event.sdp);
  });
  //*************************************streaming*****************************
  //*************************************bidding***********************************
  socket.on("join auction room", (data) => {
    console.log("maha ben ali");
    socket.join(data.room);
  });
  socket.on("leave auction room", (data) => {
    socket.leave(data.room);
  });
  socket.on("new bid", (data) => {
    bid(data.bidInfo, data.room);
  });
  const bid = async (bid, auction) => {
    try {
      const lastBid = await Auction.findById(auction, {
        bids: { $slice: 1 },
      });
      lastBidValue =
        (lastBid && lastBid.bids && lastBid.bids[0] && lastBid.bids[0].bid) ||
        0;
      // if (!(bid.bid >= bidValue + 0.5)) {
      //   bid.bid += 0.5;
      // }
      let result = await Auction.findOneAndUpdate(
        {
          _id: auction,
          $or: [{ "bids.0.bid": { $lt: bid.bid } }, { bids: { $eq: [] } }],
        },
        { $push: { bids: { $each: [bid], $position: 0 } } },
        { new: true }
      )
        .populate("bids.bidder", "_id firstName")
        .populate("seller", "_id firstName")
        .exec();
      io.to(auction).emit("new bids", result);
      if (result.bids[1] != null) {
        if (!result.bids[0].bidder._id.equals(result.bids[1].bidder._id)) {
          user = await User.findById(result.bids[1].bidder._id);
          //mailling**********************************
          const transporter = nodemailer.createTransport({
            service: "gmail",
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
            subject: "you lost your bid",
            html:
              "Hi " +
              user.firstName +
              "!<br> Your bid on <span style='font-weight:bold;font-weight:700;'> " +
              result.title +
              "</span> has been beaten by another user! <br>  Go and reclaim your spot as the highest bidder fast before it’s too late! <br> <br> <br>  Best wishes, <br> TRADR Inc.<br> TRADRcustomerservice@gmail.com <br> Privacy policy and TOS : www.wetradr.com/TOS<br>",
          };

          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log(err);
            }
          });
          //mailling**********************************
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  //*************************************bidding*****************************
});

const server = httpServer.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info("Server started on port %s.", port);
});
// const Httpserver = httpsServer.listen(portHttps, (err) => {
//   if (err) {
//     console.log(err)
//   }
//   console.info('ServerHttps started on port %s.', portHttps)
// })
