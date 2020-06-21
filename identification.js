module.exports =  (res) => {
  if(res.locals.user) return res.locals.user.identity.low
  else return undefined
}
