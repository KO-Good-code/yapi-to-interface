// 首字母大写
export const firstUpperCase = (value: string) => {
  return value.substr(0, 1).toUpperCase() + value.slice(1)
}

// 复制
export const copy = (value: any) => {
  let copy = document.createElement('textarea')
  document.body.appendChild(copy)
  copy.value = value
  copy.select()
  document.execCommand('copy')
  document.body.removeChild(copy)
}

// 成功或者失败的提示，这个是参考别人的，后期让ui出图
export const message = (opt: any) => {
  var $div = document.createElement('div')
  // @ts-ignore
  $div.classList = 'to-ts-msg'

  var $img = document.createElement('img')
  var imgMap: any = {
    // 可以引入file-loader
    success: './assets/img/success.png',
    error: './assets/img/error.png'
  }
  $img.src = imgMap[opt.type]

  var $text = document.createElement('div')

  $text.innerText = opt.text || 'success~'

  $div.appendChild($img)
  $div.appendChild($text)

  document.body.appendChild($div)

  setTimeout(function () {
    // @ts-ignore
    $div.classList = 'to-ts-msg is-leaving'
    $div.addEventListener('transitionend', function () {
      document.body.contains($div) && document.body.removeChild($div)
    })
  }, 2000)
}

// 字符串存在,时进行循环切割，比如'null,number'变成null | number
export const formatStr = (type: any, format = ' | ') => {
  // 如果是数组则直接转换
  if (!(type instanceof Array)) {
    type = type.split(',')
  }

  type.forEach((item: string, index: number) => {
    if (item === 'integer') {
      type[index] = 'number'
    }
  })

  return type.join(format)
}


