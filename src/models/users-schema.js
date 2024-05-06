const usersSchema = {
  name: String,
  email: String,
  password: String,
  attempt: Number,
  lockedUntil: Date,
  new: Boolean,
};

module.exports = usersSchema;
