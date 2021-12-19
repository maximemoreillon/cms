module.exports =  (res) => {

  const current_user = res.locals.user

  if(!current_user) return undefined
  
  return current_user._id
    ?? current_user.properties._id
    ?? current_user.identity.low
    ?? current_user.identity
}
