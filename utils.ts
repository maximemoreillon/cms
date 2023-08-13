import { Response } from "express"

export const current_user_is_admin = (res: Response) => {
  const { user } = res.locals
  return user.isAdmin || user.properties.isAdmin
}

export const get_current_user_id = (res: Response) => {
  const current_user = res.locals.user

  if (!current_user) return null

  return (
    current_user._id ??
    current_user.properties._id ??
    current_user.identity.low ??
    current_user.identity
  )
}
