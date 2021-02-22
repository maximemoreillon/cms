module.exports =  (res) => {
  return res.locals.user?.identity?.low
    ?? res.locals.user?.identity
}
