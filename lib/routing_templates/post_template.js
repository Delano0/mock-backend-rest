const {
  build_response_default,
  build_request_params_response,
  build_request_authorization_response
} = require('./build_koa_router_model')

/**
  * @param {object} post_api_object
  * @param {object} post_api_object.path
  * @param {object} post_api_object.response
  * @param {number|undefined} post_api_object.status
  * @param {object|undefined} post_api_object.params_response
  * @param {object|undefined} post_api_object.authorization
  * @returns {string}
*/
function post_template({path, response, status = 200, params_response, authorization}) {
  let internal_body_part = ''
  if(params_response) {
    internal_body_part += build_request_params_response(params_response)
  }

  if(authorization) {
    internal_body_part += build_request_authorization_response(authorization, path, 'POST')
  }

  response = build_response_default(response, path, 'POST')
  return `
    router.post('${path}', async (ctx) => {
      ctx.status = ${status}
      ${internal_body_part}
      ctx.body = ${response}
      return ctx
    })`
}

module.exports = {
  post_template
}
