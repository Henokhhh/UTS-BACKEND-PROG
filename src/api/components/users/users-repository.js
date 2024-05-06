const { User } = require('../../../models');

async function getUsers(page, pageSize, search, sort) {
  const skip = (page - 1) * pageSize;
  let query = User.find({});

  if (search && search.trim() !== '') {
    const [field, value] = search.split(':');
    const regex = new RegExp(value, 'i');

    if (field === 'email') {
      query = query.where('email').regex(regex);
    } else if (field === 'name') {
      query = query.where('name').regex(regex);
    }
  }

  if (sort) {
    const [field, order] = sort.split(':');
    query = query.sort({ [field]: order === 'desc' ? -1 : 1 });
  }

  const totalUsers = await getTotalUsers(search);

  const totalPages = Math.ceil(totalUsers / pageSize);

  const users = await query.skip(skip).limit(pageSize);
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }));
}

async function getTotalUsers(search) {
  let query = User.find({});

  if (search) {
    const [field, value] = search.split(':');
    const regex = new RegExp(value, 'i');
    if (field === 'email') {
      query = query.where('email').regex(regex);
    } else if (field === 'name') {
      query = query.where('name').regex(regex);
    }
  }

  const totalUsers = await query.countDocuments();
  return totalUsers;
}

async function getUser(id) {
  return User.findById(id);
}

async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  getTotalUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
