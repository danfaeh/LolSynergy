var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var compSchema = new Schema({
  created: { type: Date },
  updated: { type: Date },
  c1: { type: String, required: true},
  c2: { type: String, required: true},
  c3: { type: String, required: true},
  c4: { type: String, required: true},
  c5: { type: String, required: true},
  // description: { type: String }
  // userName: { type: String }
});

var Comp = mongoose.model('Comp', compSchema);
module.exports = Comp;
