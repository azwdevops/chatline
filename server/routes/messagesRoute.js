const {
  addMessage,
  getAllMessages,
} = require("../controllers/messagesController");

const router = require("express").Router();

router.post("/add-message", addMessage);
router.get("/get-all-messages/:from/:to", getAllMessages);

module.exports = router;
