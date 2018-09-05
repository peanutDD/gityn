import CryptoJS from 'crypto-js'

const languages = ['php', 'python', 'js', 'bash']

const cachePrefix = 'run_code_result_'

const RunPlugin = (md) => {
  const temp = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    if (!languages.includes(token.info)) {
      return temp(tokens, idx, options, env, slf)
    }

    const code = token.content.trim()
    const firstLine = code.split(/\n/)[0].trim()
    if (!firstLine.includes('--run--')) {
      return temp(tokens, idx, options, env, slf)
    }

    const hash = CryptoJS.MD5(code).toString()

    const click = `
      var code = '${encodeURIComponent(code).replace(/'/g, '\\\'')}'
      code = decodeURIComponent(code)
      var resultDiv = this.parentElement.firstChild
      resultDiv.innerText = '运行中……'

      fetch('/api/run', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({language: '${token.info}', code: code})
      }).then(res => {
        res.json().then(result => {
          if (result.status === 'ok') {
            resultDiv.innerText = result.data
            localStorage.setItem('${cachePrefix}${hash}', resultDiv.innerHTML)
          } else {
            resultDiv.innerText = result.message
          }
        }).catch(e => {
          resultDiv.innerText = e.message
        })
      }).catch(e => {
        resultDiv.innerText = e.message
      })
    `
    const result = localStorage[`${cachePrefix}${hash}`] || ''

    const resultDiv = `<div id="run-result-${hash}" style="position: relative;border-top: dashed 1px #888; padding: .5em 0; margin-top: 1.5em;"><div style="padding: .5em 0">${result}</div><button style="position: absolute; top: -.7em; height: 0; width: 0; border-left: .7em #b7b3b3 solid; border-top: .6em #dddddd00 solid; border-bottom: .6em #dddddd00 solid; border-right: 0; background: rgba(0, 0, 0, 0); cursor: pointer; outline: none" onclick="${click}"></button></div>`

    const codeContent = temp(tokens, idx, options, env, slf).trim().replace(/<\/pre>$/, '')

    return `${codeContent}${resultDiv}</pre>`
  }
}

RunPlugin.clearCache = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(cachePrefix)) {
      localStorage.removeItem(key)
    }
  })
}

export default RunPlugin
