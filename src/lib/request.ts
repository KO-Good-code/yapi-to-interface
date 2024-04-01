  // 发送请求，获取yapi接口的内容
  const httpRequest = new XMLHttpRequest()

  export const request = ()=> {
    // 获取yapi的id，然后调对应的接口获取数据
    const interfaceId = window.location.pathname.replace(
      /\/project\/\d+\/interface\/api\//,
      ''
    )
    
    // 一般yapi都是这个接口返回数据，如果不是这个接口可以进行更换
    const url = 'https://' +
      window.location.host +
      '/api/interface/get?id=' +
      interfaceId

    return new Promise((resolve) => {
      httpRequest.open(
        'GET',
        url,
        true
      )

      httpRequest.send()

      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
          resolve(httpRequest.responseText)
        } 
      }
    })
  }


