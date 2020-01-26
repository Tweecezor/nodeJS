const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const autoincrement = require("mongoose-easy-auto-increment");

mongoose.Promise = global.Promise;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    default: ""
  },
  middleName: {
    type: String,
    default: ""
  },
  surName: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  permissionId: {
    type: Number,
    default: 0
  },
  permission: {
    chat: {
      C: { type: Boolean },
      R: { type: Boolean },
      U: { type: Boolean },
      D: { type: Boolean }
    },
    news: {
      C: { type: Boolean },
      R: { type: Boolean },
      U: { type: Boolean },
      D: { type: Boolean }
    },
    setting: {
      C: { type: Boolean },
      R: { type: Boolean },
      U: { type: Boolean },
      D: { type: Boolean }
    }
  },
  accessToken: {
    type: String,
    default: ""
  },
  refreshToken: {
    type: String,
    default: ""
  },
  accessTokenExpiredAt: Date,
  refreshTokenExpiredAt: Date
});
userSchema.plugin(autoincrement, { field: "_id", collection: "users" });

const User = mongoose.model("user", userSchema);

const newsScheme = new Schema({
  id: String,
  created_at: Date,
  text: String,
  title: String,
  user: {
    firstName: String,
    id: String,
    image: String,
    middleName: String,
    surName: String,
    username: String
  }
});

const News = mongoose.model("news", newsScheme);
newsScheme.plugin(autoincrement, { field: "_id", collection: "news" });

module.exports.user = User;
module.exports.news = News;
