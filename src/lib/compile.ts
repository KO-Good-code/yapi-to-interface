// 遍历然后转为ts的interface
import { firstUpperCase, formatStr } from '../utils/utils'

export default class Compile {
  exportStr: string                         // 最后生成的interface值，怕后期要用就拿出来 
  KEY_WORD: string
  API_URL: string
  constructor(url: string) {
    this.exportStr = ''
    this.API_URL = url
  }

  // 深拷贝
  deepClone(source: any) {
    // 判断目标是数组还是对象
    const targetObj: any = source instanceof Array ? [] : {}

    for (let key in source) {
      // 如果值是对象或者数组，就递归一下
      if (source[key] && typeof source[key] === 'object') { 
        targetObj[key] = this.deepClone(source[key])
      } else { 
        targetObj[key] = source[key]
      }
    }
    return targetObj
  }

  // 深度遍历对象，然后根据值的类型转为各自的类型，不复用deepClone是不想强耦合
  deepCloneToType(source: any) {
    // 判断目标是数组还是对象
    const targetObj: any = source instanceof Array ? [] : {}

    for (let key in source) {
      // 如果值是对象或者数组，就递归一下
      if (source[key] && typeof source[key] === 'object') { 
        targetObj[key] = this.deepCloneToType(source[key])
      } else { 
        // 如果是基本类型，就直接赋值
        const type = typeof source[key]

        targetObj[key] = this.judgeValueType(type)
      }
    }
    return targetObj;
  }

  // 判断值的类型
  judgeValueType(type: any) {
    let returnType = type

    switch(type) {
      case 'number':
        returnType = 'number'
      break
      case 'string':
        returnType = 'string'
      break
      case 'boolean':
        returnType =  'boolean'
      break
      default:
        // 其他的一律为any， 后期开发再改
        returnType =  'any'
        break
    }

    return returnType
  }

  // 变化类型之后进行遍历，格式化为ts的interface，需要考虑复杂类型的情况，增加几个子interface
  formatToTsInterface(source: any, interFaceName: string) {
    let cloneData = this.deepClone(source)
    interFaceName = firstUpperCase(interFaceName)

    Object.keys(source).forEach(item => {
      // interface的名字
      const name = `${interFaceName}${firstUpperCase(item)}`

      if (typeof source[item] === 'object') {
        if (source[item] instanceof Array) {
          // 如果是数组，再判断数组元素是不是复杂类型，我们只以第一个元素为例，其他的不管,如果数组为空，则为any
          if (source[item].length === 0) {
            cloneData[item] = `any[]`
          } else {
            if (typeof source[item][0] === 'object') {
              // 如果元素是复杂类型，就进行替换，而且是驼峰命名, 并且进行递归，而且是以第一个元素为例
              cloneData[item] = `${name}[]`
              this.formatToTsInterface(source[item][0], name)
            } else {
              // 只以第一个元素为例，如果值是基础类型，直接用类型命名
              const type = typeof source[item][0]
              cloneData[item] = `${type}[]`
            }
          }
        } else {
          cloneData[item] = `${name}`
          this.formatToTsInterface(source[item], name)
        }
       
      }
    })
  
    let cloneDataStr = ''

    Object.keys(cloneData).forEach(item => {
      cloneDataStr += `\n  ${item}: ${cloneData[item]}, `
    })
    
    this.generateExportStr(interFaceName, cloneDataStr)
    
  }
 
  // json_schema格式下的数据进行转换为ts
  jsonSchemaToTsInterface(source: any, interFaceName: string) {
    let cloneData = this.deepClone(source)
    interFaceName = firstUpperCase(interFaceName);
    for(let key in source) {
      // interface的名字
      const name = `${interFaceName}${firstUpperCase(key)}`;
      console.log(source[key], key);
      const { type, description, properties, items, required=[] } = source[key]

      // required属性表示必选，不做处理
      if (key !== 'required') {
        // 如果是多种类型，比如返回'null, number'，或者是integer进行转换
        cloneData[key] = { 
          type: formatStr(type),
          description
        }
  
        // 判断哪些是必选的
        if (cloneData.required && cloneData.required.includes(key)) {
          cloneData[key].required = true
        }
      }
   
      // 如果是对象，则interface名为key首字母大写
      if (type === 'object') {
        cloneData[key].type = name
      }

      // 如果是数组。则有items属性，进行子元素分析
      if (type === 'array') {
        // 如果没有type则设置为any
        const itemType = items && items.type? items.type: 'any'
        
        switch(itemType) {
          case 'object':
          case 'array':
              cloneData[key].type = `${name}[]`
              const { properties, required = [] } = items;
              // items.properties.required = required;
              this.jsonSchemaToTsInterface({ ...properties, required }, name)
              break
            default:
              cloneData[key].type = `${itemType}[]`
              break
          }
      }

      // 如果是对象object则有properties属性
      if (properties) {
        properties.required = required;
        this.jsonSchemaToTsInterface(properties, name)
        // 将多余的属性删掉，只需要interface相关的
        delete cloneData[key].properties 
      } 
    }

    // 过渡
    let cloneDataStr = ''

    Object.keys(cloneData).forEach(item => {
      // 加上注释
      if(cloneData[item].description){
        cloneDataStr += `\n  // ${cloneData[item].description} `
      }
      // 加上类型
      if (cloneData[item].type) {
        cloneDataStr += `\n  ${item}${cloneData[item].required ? '' : '?'}: ${cloneData[item].type}, `
      }
    })
    
    this.generateExportStr(interFaceName, cloneDataStr)
      
  }

  // query参数或者form参数格式化成ts，直接返回的是个数组，循环转换
  queryToTsInterface (source: any, interFaceName: string){
    let str = ''
    interFaceName = firstUpperCase(interFaceName)

    source.forEach((item: any) => {
      const { desc, name, required } = item
      // desc一般是备注
      if (desc) {
        str += `\n // ${desc}`
      }

      str += `\n ${name}${required !== '1' ? '?' : ''}: string,`
    })

    this.generateExportStr(interFaceName, str)

  }

  generateExportStr(interFaceName:string, str:string) {
        
    // 直接使用``输出的空格缩进有问题
    this.exportStr = `${this.KEY_WORD}interface ` + interFaceName + ' { '
      + str +
    '\n}\n\n' + this.exportStr
  }


  /*  编译，将方法整合在一起, 
   *  jsonObj:传入的对象主要的接口名，
   *  interfaceName: 初始值一般是接口名，驼峰命名
   *  compileType: 编译类型，因为后台返回的数据格式不同需要不同的遍历方式
  */
  compile(jsonObj: any, interfaceName: string, compileType: string, hasExport: boolean, apiName: string) {
    // 初始值
    this.exportStr = ''
    this.KEY_WORD = hasExport ? 'export ' : ''
    // 不同的数据类型有不同的转换方法
    switch (compileType) {
      case 'json_schema':
        this.jsonSchemaToTsInterface(jsonObj, interfaceName)
        break
      case 'form':
      case 'query':
        this.queryToTsInterface(jsonObj, interfaceName)
        break
      default:
        const deepCloneObj = this.deepCloneToType(jsonObj)
        this.formatToTsInterface(deepCloneObj, interfaceName)
        break
    }
    const resStr = `// ${apiName}-${this.API_URL}\n${this.exportStr}`
    return resStr
  }

}



