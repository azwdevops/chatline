const Message = require("../models/messageModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Message.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    if (data) {
      return res.json({ msg: "Message added to db successfully" });
    } else {
      return res.json({ msg: "failed to add message to db" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports.getAllMessages = async (req, res, next) => {
  try {
    const { from, to } = req.params;
    const messages = await Message.find({ users: { $all: [from, to] } }).sort({
      updatedAt: 1,
    });
    const projectedMessages = messages.map((msg) => ({
      fromSelf: msg.sender.toString() === from,
      message: msg.message.text,
    }));
    return res.json(projectedMessages);
  } catch (error) {
    next(error);
  }
};
