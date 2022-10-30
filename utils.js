exports.current_user_is_admin = (res) => {
  const {user} = res.locals
  return user.isAdmin
    || user.properties.isAdmin
}

exports.get_current_user_id = (res) => {

  const current_user = res.locals.user

  if (!current_user) return null

  return current_user._id
    ?? current_user.properties._id
    ?? current_user.identity.low
    ?? current_user.identity
}