var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var compSchema = new Schema({
  created: { type: Date },
  updated: { type: Date },
  champ1: { type: String, required: true},
  champ2: { type: String, required: true},
  champ3: { type: String, required: true},
  champ4: { type: String, required: true},
  champ5: { type: String, required: true},
  description: { type: String }
});

var Comp = mongoose.model('Comp', compSchema);
module.exports = Comp;
