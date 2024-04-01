import { copy, message, firstUpperCase } from '../utils/utils'
import { CreateElement } from '../types/index'
import { request } from './request'
import { btnType } from '../utils/dict'
import Compile from './compile'


// 插件显示的内容，需要内嵌在网页，所以采用appendChild
export default class Content {
  toTsCompile: any                 // 遍历转换对象
  hasExport: false  // 是否需要export关键字

  constructor() {
    this.toTsCompile = new Compile(location.href)
  }

  // 生成页面元素
  createElementFun(options: CreateElement) {
    let $div = document.createElement(options.elem)
    $div.innerText = options.innerText || ''
    // @ts-ignore
    $div.classList = options.classList || ''
    $div.type = options.type || ''

    return $div
  }

  // 页面加载时执行
  contentLoad(e: any) {
    const target = e.target
    
    // 主体框
    const $btnWrapper = this.createElementFun({classList: 'to-ts' })
    const $title = this.creatBtnWrapper()
    const $hasExportToggle = this.hasExportToggle()
    const $resBtn = this.createResBtn()
    const $bodyBtn = this.createBodyBtn()
    const $queryBtn = this.createQueryBtn()

    $btnWrapper.appendChild($title)
    $btnWrapper.appendChild($hasExportToggle)
    $btnWrapper.appendChild($resBtn)
    $btnWrapper.appendChild($bodyBtn)
    $btnWrapper.appendChild($queryBtn)
    target.body.appendChild($btnWrapper)

  }

  // 插件框标题
  creatBtnWrapper() {
    const $title = this.createElementFun({
      elem: 'h4', 
      classList: 'to-ts-title', 
      innerText: '接口转为ts interface'
    })
    
    return $title
  }

  // 返回值转换按钮
  createResBtn() {
    const $resBtn = this.createElementFun({
      elem: 'button', 
      classList: 'to-ts-res-btn', 
      innerText: '返回值转换'
    })
   
    $resBtn.onclick =  () => {
      this.clickCallBack($resBtn, 'resBtn')
    }

    return $resBtn
  }
  // 是否生成export关键字
  hasExportToggle() {
    const $hasExportToggle = this.createElementFun({
      elem: 'input', 
      type: 'checkbox',
      classList: 'has-export-toggle', 
    })
    const $hasExportWrapper = this.createElementFun({
      elem: 'div', 
      classList: 'has-export-wrapper', 
      innerText: 'export关键字'
    })
    $hasExportWrapper.appendChild($hasExportToggle)
    $hasExportToggle.onclick = (e: any) => {
      this.hasExport = e.target.checked;
    }

    return $hasExportWrapper
  }


  // Body参数按钮
  createBodyBtn() {
    // Body参数
    const $bodyBtn = this.createElementFun({
      elem: 'button', 
      classList: 'to-ts-req-btn', 
      innerText: 'Body参数转换'
    })

    $bodyBtn.onclick = () => {
      this.clickCallBack($bodyBtn, 'bodyBtn')
    }

    return $bodyBtn
  }

  // 生成query参数按钮
  createQueryBtn() {
    // Query参数
    const $queryBtn = this.createElementFun({
      elem: 'button', 
      classList: 'to-ts-query-btn', 
      innerText: 'Query参数转换'
    })
  
    $queryBtn.onclick = () => {
      this.clickCallBack($queryBtn, 'queryBtn')
    }
    
    return $queryBtn
  }

  // 按钮点击后回调，生成interface返回
  clickCallBack(element: any, type: string) {
    element.innerText = '转换中...'
      request().then((result: any) => {
        try {
          result = JSON.parse(result).data
          
          const title = result.title // 接口名称
          const r = result[btnType[type].field];
          const a = typeof r === "object" ? JSON.stringify(r): r;
          // 不能JSON.parse，因为存在注释, rollup强烈反对使用eval，用new Function代替
          let resBody = new Function('return ' + a)()
          let compileType = ''
          // 老接口有.do，需要去掉
          const splitPath = result.path.replace('.do', '').split('/')
          // 获取接口名，生成的interface名跟接口名绑定
          const apiPath = splitPath[splitPath.length - 1]
          let interfaceName = apiPath

          // 如果接口存在-,则去掉，并变成驼峰命名
          if (apiPath.indexOf('-') > -1) {
            const arr = apiPath.split('-')
            
            arr.forEach((item: string, index: number) => {
              if (index > 0) {
                arr[index] = firstUpperCase(item)
              }
            })
            interfaceName = arr.join('')
          } 

          // 返回值跟参数分开做处理
          if (type === 'resBtn') {
            if (result.res_body_is_json_schema) {
              // 当res_body_type字段为json时取resBody.properties，为raw时不做处理，就是resBody
              if (result.res_body_type === 'json') {
                resBody = resBody.properties
                compileType = 'json_schema'
              }
            }
          } else if (type === 'bodyBtn') {
            interfaceName += 'Body'
            // post请求有两种，一种是form，一种是json,
            if (result.req_body_type === 'form') {
              resBody = result.req_body_form
              compileType = 'form'
            } else {  
              // json有两种，一种是res_body_is_json_schema为true，一种是false
              if (result.req_body_is_json_schema) {
                resBody = resBody.properties
                compileType = 'json_schema'
              }
            }
          } else if (type === 'queryBtn') {
            interfaceName += 'Query'
            compileType = 'query'
          }

          const value = this.toTsCompile.compile(resBody, interfaceName, compileType, this.hasExport, title)
          
          copy(value)
          element.innerText = btnType[type].innerText
          message({ text: '复制成功', type: 'success' })
        } catch(err) {
          console.error(err)
          element.innerText = btnType[type].innerText
          message({ text: `生成失败, 请检查是否有${btnType[type].innerText}`, type: 'error' })
        }
      })
  }
}


