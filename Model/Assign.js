const mongoose = require("mongoose");

const AssignSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
  },
  companyId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Company",
  },
  agentId: {
    type: [mongoose.Schema.Types.ObjectId], 
    ref: "Agent",
  },
  serviceId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Request",
  },
});

module.exports = mongoose.model("Assign", AssignSchema);
