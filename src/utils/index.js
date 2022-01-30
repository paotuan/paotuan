
export function throttle(func, wait) {
  let timeout
  return function () {
    let that = this
    let args = arguments

    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null
        func.apply(that, args)
      }, wait)
    }
  }
}

/**
 * 利用 document.title 做新消息提示
 * @export
 * @param {Number} count
 */
export function titleNotify(count) {
  const hasNewMessage = count > 0
  if (hasNewMessage) {
    if (document.title.search(/\((.*?)\)/) >= 0) {
      document.title = document.title.replace(/\((.*?)\)/, `(${count > 99 ? '99+' : count})`)
    } else {
      document.title = `(${count})${document.title}`
    }
  } else {
    document.title = document.title.replace(/\((.*?)\)/, '')
  }
}

// 异步加载代码
export function _loadScript(src, callback) {
  const script = document.createElement('script')
  script.addEventListener('load', callback)
  script.src = src
  if (src.startsWith('http')) {
    script.crossOrigin = 'anonymous'
  }
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript.parentNode.insertBefore(script, firstScript)
}

// 压缩 cos url，主要是处理群头像 100 字节的限制
export function shortenCosUrl(url) {
  let avatar = url.trim()
  let matchCosUrl = avatar.match(/^https:\/\/cos\.ap-shanghai\.myqcloud\.com\/(.{4})-shanghai-(.+)\?.+/)
  if (matchCosUrl) {
    return `!${matchCosUrl[1]}${matchCosUrl[2]}` // 用 ！开头表示特殊 url，然后把其他重复的去掉，应该刚好 100 字节
  } else {
    return avatar
  }
}

// 还原 cos url
export function expandCosUrl(url) {
  if (url.startsWith('!')) {
    return `https://cos.ap-shanghai.myqcloud.com/${url.slice(1, 5)}-shanghai-${url.slice(5)}`
  } else {
    return url
  }
}
