const jwt = require("jsonwebtoken");
const BookModel = require("../models/BookModel");
const mongoose = require('mongoose')

// const tokenRegex = /^[A-Za-z0-9-=]+\.[A-Za-z0-9-=]+\.?[A-Za-z0-9-_.+/=]*$/;

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

// ////////////////////////////////////////////[Authentication]///////////////////////////////////////////////////////
const authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    let secretKey = "Group33-book/Management";

    if (!token) { return res.status(400).send({ status: false, msg: "Token must be presents" }) }
    //if (!tokenRegex.test(token)) return res.send(400).send({ status: false, message: "Please provide a valid  token" })
       
   jwt.verify(token,secretKey, function(err, decodedToken){
      if(err){ return res.status(401).send({status:false, message:"Invalid Token"}) }
      else { 
        req.token = decodedToken
         next();}
    })

  } catch (err) {
    res.status(500).send({ msg: "Error", error: err.message })
  }
}

// ///////////////////////////[Authorization]///////////////////////////////////////////////////////////////////////

const authorization = async function (req, res, next) {
  try {
   let bookId = req.params.bookId;

    let token = req.headers["x-api-key"]
    let decodedToken = jwt.verify(token, "Group33-book/Management")
    let decodedUser = decodedToken.userId
    
     if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "please provided valid book id" });

    const findBook = await BookModel.findOne({ _id: bookId, isDeleted: false });

    if (!findBook) return res.status(404).send({ status: false, msg: "No book found or it may be deleted" });
        
    const user = findBook.userId.toString()
    
    console.log(decodedUser)
    console.log(user)

    if (decodedUser == user) { next() }
    else {
      res.status(401).send({ status: false, message: "You are not authorised to perform this action" })
    }
  } catch (err) {
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

module.exports.authentication = authentication;
module.exports.authorization = authorization;
