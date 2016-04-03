var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var championSchema = new Schema({
  name: { type: String },
  position: { type: String },
  damage: { type: String },
  hardcc: { type: Number },
  tank: { type: Boolean },
  engage: { type: Boolean },
  seige: { type: Boolean },
  waveclear: { type: Boolean },
 	aram: { type: String }
});

var Champion = mongoose.model('Champion', championSchema);
module.exports = Champion;
