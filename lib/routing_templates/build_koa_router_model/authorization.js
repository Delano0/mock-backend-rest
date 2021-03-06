const {build_response_default} = require('./body_default')

/**
* @param {string} cmd command what should be executed
* @returns {Promise<string>|Promise<null>} return null if command executed successful or cmd if something went wrong
*/

function build_request_authorization_response(authorization, path, http_method) {

  const {unauthorized = {unauthorized: 'unauthorized'}, status = 401, token} = authorization

  return `\n
    const token = ctx.request.token
    if(token !== '${token}') {
      ctx.status = ${status}
      ctx.body = ${build_response_default(unauthorized, path, http_method)}
      return ctx
    }
  \n`
}

module.exports = {
  build_request_authorization_response
}