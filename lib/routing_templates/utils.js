const fs = require('fs')
const path = require('path')

/**
 * @param {any} item argument what will be asserted as a string
 * @returns {boolean} returns if argument item is string
*/
function is_string(item) {
  return Object.prototype.toString.call(item) === '[object String]'
}

/**
 * @param {any} item argument what will be asserted as a file what should be found if FS
 * @returns {boolean} returns if argument item is file what exists in FS
*/
function is_file(item) {
  return fs.existsSync(item) || fs.existsSync(path.resolve(process.cwd(), item))
}

function form_response(resp_item, path, http_method) {

  function stringify_response(item, path, method) {
    try {
      return JSON.stringify(item)
    } catch(_) {
      throw new Error(
        'Something went wrong with response data' +
        `Please check item with path: ${path} where method is: ${method}`
      )
    }
  }

  if(!is_string(resp_item)) {
    return stringify_response(resp_item, path, http_method)
  }
  if(is_string(resp_item) && is_file(resp_item)) {
    return `fs.readFileSync("${resp_item}", {'encoding': 'utf8'})`
  }
  if(is_string(resp_item)) {
    return resp_item
  }

  return JSON.stringify({data: 'default'})
}

function build_request_params_response(params_response, path, http_method) {
  let request_params_response = ''
  function form_params_variables(params) {
    // params example
    // "id": {
    //   "value": "testId",
    //   "response": {
    //     "testId": "testId"
    //   }
    // },
    // "user": {
    //   "value": "testUser",
    //   "response": {
    //     "testId": "testId"
    //   }
    // },
    return Object.keys(params).reduce((rout_body_part, key) => {
      rout_body_part += `const ${key} = ctx.params.${key} \n`
      return rout_body_part
    }, '')
  }

  function form_conditional_statements(params, general_response) {
    let condition_statements = ''
    // params example
    // "id": {
    //   "value": "testId",
    //   "response": {
    //     "testId": "testId"
    //   }
    // },
    // "user": {
    //   "value": "testUser",
    //   "response": {
    //     "testId": "testId"
    //   }
    // }
    // general_response examplecc
    // {"testId": "testId"}
    const params_keys = Object.keys(params)

    if(general_response) {
      console.log('A')
      condition_statements += params_keys.reduce((statement_start, key, index) => {
        // if not last item in if need add "&&" as default
        const is_last_item = params_keys.length - 1 === index

        let assert_item = params[key].value ? `${key} === "${params[key].value}"` : key

        if(is_last_item) {
          // close ) of is statement and start to form closure body
          assert_item += `) { \n
                            ctx.body = ${form_response(general_response, path, http_method)} \n
                            return ctx
                          } \n`
        } else {
          assert_item += ' && '
        }
        statement_start += assert_item
        return statement_start
      }, 'if(')
      // should be something like
      // if(a=="test" && b){
      //   ctx.body = {"test":"test"}
      //   return ctx
      // }
    }
    condition_statements += params_keys.reduce((statement_start, key) => {
      function add_condition_arguments(assertion) {
        return `if(${assertion})`
      }

      let assert_item = add_condition_arguments(params[key].value ? `${key} === "${params[key].value}"` : key)
      // body implementation
      if(params[key].response) {
        assert_item += `{ \n
          ctx.body = ${form_response(params[key].response, path, http_method)} \n
          return ctx
        }`
      } else {
        assert_item += '{}'
      }
      statement_start += assert_item
      return statement_start
    }, '')
    return condition_statements
  }

  const params_response_without_general_response = Object.keys(params_response).reduce((without_response, current_item) => {
    if(current_item !== 'response') {
      without_response[current_item] = params_response[current_item]
    }
    return without_response
  }, {})
  // example
  // const a = ctx.params.a
  // const b = ctx.params.a
  const params_koa_part = form_params_variables(params_response_without_general_response)

  const params_conditions_part = form_conditional_statements(params_response_without_general_response, params_response.response)

  request_params_response += `\n ${params_koa_part} \n ${params_conditions_part} \n`
  return request_params_response
}

module.exports = {
  is_string,
  is_file,
  form_response,
  build_request_params_response
}
