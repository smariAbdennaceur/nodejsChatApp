const CURRENT_WORKING_DIR = process.cwd();
require("dotenv").config();
const express = require("express");
const cookieParser = require('cookie-parser');
const compress = require('compression');
const helmet = require("helmet");
const cors = require('cors');
const app = express();
const config = require("./config/config")
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser())
app.use(compress())
// secure apps by setting various HTTP headers
app.use(helmet())
// enable CORS - Cross Origin Resource Sharing
app.use(cors())
// var whitelist = ['http://localhost:3000', 'https://test.tradr.wijaa-technologies.com']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       console.log('maha')
//       callback(null, true)
//     } else {
//       console.log('ikram')
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions))// express routing
// app.use(cors({origin: 'http://localhost:3000'}))// express routing
app.use(express.static("public"));
// routes
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const auctionRoutes = require("./routes/auction.routes");
const postRoutes = require("./routes/post.routes");
const categoryRoutes = require("./routes/category.routes");
const cardRoutes = require("./routes/card.routes");
const countryRoutes = require("./routes/country.routes");
const razzRoutes = require("./routes/razz.routes");
const marketRoutes = require("./routes/market.routes");
const chatconversationRoutes = require("./routes/ChatConversation.routes");
const chatmessagesRoutes = require("./routes/ChatMessage.routes");
// mount routes
app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', auctionRoutes)
app.use('/', postRoutes)
app.use('/',categoryRoutes)
app.use('/',cardRoutes)
app.use('/',countryRoutes)
app.use('/',razzRoutes)
app.use('/',marketRoutes)
app.use('/',chatconversationRoutes)
app.use('/',chatmessagesRoutes)
// Catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({"error" : err.name + ": " + err.message})
  }else if (err) {
    res.status(400).json({"error" : err.name + ": " + err.message})
    console.log(err)
  }
})



module.exports=app;
