exports.error_handling = (error, res) => {
  console.log(error)
  let status_code = error.code || 500
  const message = error.message || error
  if(isNaN(status_code)) status_code = 500
  res.status(status_code).send(message)
}


exports.current_user_is_admin = (res) => {
  const {user} = res.locals
  return user.isAdmin
    || user.properties.isAdmin

}