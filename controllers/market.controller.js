const Card = require('../models/card.model')
const Auction = require('../models/auction.model');



const list = async (req,res) => {
    let card = await Card.find().select('_id title subtitle information price priceShipping category country isSponsored created likes owner buyers').populate('owner buyers','_id firstName  lastName rate').exec();
    let auction = await Auction.find({ended:false}).select('_id title subtitle information bidStart bidEnd ended category startingBid safetyPrice created likes bids seller price_Shipping').populate('seller','_id firstName lastName rate').exec();
    let market = card.concat(auction)
    try {
        market=market.sort((a, b) => (a.created > b.created) ? -1 : ((b.created > a.created) ? 1 : 0));
        market.sort((a) => (a.isSponsored) ? -1 : ((!a.isSponsored) ? 1 : 0))
        res.json(market)

    } catch (err) {
        console.log(err)
    }
}
module.exports = {

    list

}