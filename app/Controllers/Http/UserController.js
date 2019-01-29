'use strict'

const User = use('App/Models/User')

class UserController {
  async signup ({ request, response, auth }) {
      const userData = request.only(['name', 'username', 'email', 'password'])
      try {
        const user = await User.create(userData)
        const token = await auth.generate(user)
        return response.json({
            status: 'success',
            data: token
        })
      } catch (error) {
          return response.status(400).json({
            status: 'error',
            message: 'There was a problem creating the user, please try again later.'
          })
      }
  }

  async login ({ request, response, auth }) {
    try {
      const token = await auth.attempt(
        request.input('email'),
        request.input('password')
      )

      return response.json({
        status: 'success',
        data: token
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'Invalid email/password'
      })
    }
  }

  async me ({ auth, response }) {
    const user = await User.query()
      .where('id', auth.current.user.id)
      .with('tweets', builder => {
        builder.with('user')
        builder.with('favorites')
        builder.with('replies')
      }) //nested eager load
      .with('following')
      .with('follower')
      .with('favorites')
      .with('favorites.tweet', builder => {
        builder.with('user')
        builder.with('favorites')
        builder.with('replies')
      }).firstOrFail()

    return response.json({
      status: 'success',
      data: user
    })
  }
}

module.exports = UserController
