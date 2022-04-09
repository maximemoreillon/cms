exports.current_user_is_admin = (res) => {
  const {user} = res.locals
  return user.isAdmin
    || user.properties.isAdmin
}
