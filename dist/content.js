(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global['za-api-to-interface'] = factory());
}(this, (function () {
  // 首字母大写
  const firstUpperCase = (value) => {
      return value.substr(0, 1).toUpperCase() + value.slice(1);
  };
  // 复制
  const copy = (value) => {
      let copy = document.createElement('textarea');
      document.body.appendChild(copy);
      copy.value = value;
      copy.select();
      document.execCommand('copy');
      document.body.removeChild(copy);
  };
  // 成功或者失败的提示，这个是参考别人的，后期让ui出图
  const message = (opt) => {
      var $div = document.createElement('div');
      // @ts-ignore
      $div.classList = 'to-ts-msg';
      var $img = document.createElement('img');
      var imgMap = {
          // 可以引入file-loader
          success: './assets/img/success.png',
          error: './assets/img/error.png'
      };
      $img.src = imgMap[opt.type];
      var $text = document.createElement('div');
      $text.innerText = opt.text || 'success~';
      $div.appendChild($img);
      $div.appendChild($text);
      document.body.appendChild($div);
      setTimeout(function () {
          // @ts-ignore
          $div.classList = 'to-ts-msg is-leaving';
          $div.addEventListener('transitionend', function () {
              document.body.contains($div) && document.body.removeChild($div);
          });
      }, 2000);
  };
  // 字符串存在,时进行循环切割，比如'null,number'变成null | number
  const formatStr = (type, format = ' | ') => {
      // 如果是数组则直接转换
      if (!(type instanceof Array)) {
          type = type.split(',');
      }
      type.forEach((item, index) => {
          if (item === 'integer') {
              type[index] = 'number';
          }
      });
      return type.join(format);
  };

  // 发送请求，获取yapi接口的内容
  const httpRequest = new XMLHttpRequest();
  const request = () => {
      // 获取yapi的id，然后调对应的接口获取数据
      const interfaceId = window.location.pathname.replace(/\/project\/\d+\/interface\/api\//, '');
      // 一般yapi都是这个接口返回数据，如果不是这个接口可以进行更换
      const url = 'https://' +
          window.location.host +
          '/api/interface/get?id=' +
          interfaceId;
      return new Promise((resolve) => {
          httpRequest.open('GET', url, true);
          httpRequest.send();
          httpRequest.onreadystatechange = () => {
              if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                  resolve(httpRequest.responseText);
              }
          };
      });
  };

  const btnType = {
      'resBtn': {
          field: 'res_body',
          innerText: '返回值转换'
      },
      'bodyBtn': {
          field: 'req_body_other',
          innerText: 'Body参数转换'
      },
      'queryBtn': {
          field: 'req_query',
          innerText: 'Query参数转换'
      },
  };

  // 遍历然后转为ts的interface
  class Compile {
      constructor(url) {
          this.exportStr = '';
          this.API_URL = url;
      }
      // 深拷贝
      deepClone(source) {
          // 判断目标是数组还是对象
          const targetObj = source instanceof Array ? [] : {};
          for (let key in source) {
              // 如果值是对象或者数组，就递归一下
              if (source[key] && typeof source[key] === 'object') {
                  targetObj[key] = this.deepClone(source[key]);
              }
              else {
                  targetObj[key] = source[key];
              }
          }
          return targetObj;
      }
      // 深度遍历对象，然后根据值的类型转为各自的类型，不复用deepClone是不想强耦合
      deepCloneToType(source) {
          // 判断目标是数组还是对象
          const targetObj = source instanceof Array ? [] : {};
          for (let key in source) {
              // 如果值是对象或者数组，就递归一下
              if (source[key] && typeof source[key] === 'object') {
                  targetObj[key] = this.deepCloneToType(source[key]);
              }
              else {
                  // 如果是基本类型，就直接赋值
                  const type = typeof source[key];
                  targetObj[key] = this.judgeValueType(type);
              }
          }
          return targetObj;
      }
      // 判断值的类型
      judgeValueType(type) {
          let returnType = type;
          switch (type) {
              case 'number':
                  returnType = 'number';
                  break;
              case 'string':
                  returnType = 'string';
                  break;
              case 'boolean':
                  returnType = 'boolean';
                  break;
              default:
                  // 其他的一律为any， 后期开发再改
                  returnType = 'any';
                  break;
          }
          return returnType;
      }
      // 变化类型之后进行遍历，格式化为ts的interface，需要考虑复杂类型的情况，增加几个子interface
      formatToTsInterface(source, interFaceName) {
          let cloneData = this.deepClone(source);
          interFaceName = firstUpperCase(interFaceName);
          Object.keys(source).forEach(item => {
              // interface的名字
              const name = `${interFaceName}${firstUpperCase(item)}`;
              if (typeof source[item] === 'object') {
                  if (source[item] instanceof Array) {
                      // 如果是数组，再判断数组元素是不是复杂类型，我们只以第一个元素为例，其他的不管,如果数组为空，则为any
                      if (source[item].length === 0) {
                          cloneData[item] = `any[]`;
                      }
                      else {
                          if (typeof source[item][0] === 'object') {
                              // 如果元素是复杂类型，就进行替换，而且是驼峰命名, 并且进行递归，而且是以第一个元素为例
                              cloneData[item] = `${name}[]`;
                              this.formatToTsInterface(source[item][0], name);
                          }
                          else {
                              // 只以第一个元素为例，如果值是基础类型，直接用类型命名
                              const type = typeof source[item][0];
                              cloneData[item] = `${type}[]`;
                          }
                      }
                  }
                  else {
                      cloneData[item] = `${name}`;
                      this.formatToTsInterface(source[item], name);
                  }
              }
          });
          let cloneDataStr = '';
          Object.keys(cloneData).forEach(item => {
              cloneDataStr += `\n  ${item}: ${cloneData[item]}, `;
          });
          this.generateExportStr(interFaceName, cloneDataStr);
      }
      // json_schema格式下的数据进行转换为ts
      jsonSchemaToTsInterface(source, interFaceName) {
          let cloneData = this.deepClone(source);
          interFaceName = firstUpperCase(interFaceName);
          for (let key in source) {
              // interface的名字
              const name = `${interFaceName}${firstUpperCase(key)}`;
              const { type, description, properties, items } = source[key];
              // required属性表示必选，不做处理
              if (key !== 'required') {
                  // 如果是多种类型，比如返回'null, number'，或者是integer进行转换
                  cloneData[key] = {
                      type: formatStr(type),
                      description
                  };
                  // 判断哪些是必选的
                  if (cloneData.required && cloneData.required.includes(key)) {
                      cloneData[key].required = true;
                  }
              }
              // 如果是对象，则interface名为key首字母大写
              if (type === 'object') {
                  cloneData[key].type = name;
              }
              // 如果是数组。则有items属性，进行子元素分析
              if (type === 'array') {
                  // 如果没有type则设置为any
                  const itemType = items && items.type ? items.type : 'any';
                  switch (itemType) {
                      case 'object':
                      case 'array':
                          cloneData[key].type = `${name}[]`;
                          this.jsonSchemaToTsInterface(items.properties, name);
                          break;
                      default:
                          cloneData[key].type = `${itemType}[]`;
                          break;
                  }
              }
              // 如果是对象object则有properties属性
              if (properties) {
                  this.jsonSchemaToTsInterface(properties, name);
                  // 将多余的属性删掉，只需要interface相关的
                  delete cloneData[key].properties;
              }
          }
          // 过渡
          let cloneDataStr = '';
          Object.keys(cloneData).forEach(item => {
              // 加上注释
              if (cloneData[item].description) {
                  cloneDataStr += `\n  // ${cloneData[item].description} `;
              }
              // 加上类型
              if (cloneData[item].type) {
                  cloneDataStr += `\n  ${item}${cloneData[item].required ? '' : '?'}: ${cloneData[item].type}, `;
              }
          });
          this.generateExportStr(interFaceName, cloneDataStr);
      }
      // query参数或者form参数格式化成ts，直接返回的是个数组，循环转换
      queryToTsInterface(source, interFaceName) {
          let str = '';
          interFaceName = firstUpperCase(interFaceName);
          source.forEach((item) => {
              const { desc, name, required } = item;
              // desc一般是备注
              if (desc) {
                  str += `\n // ${desc}`;
              }
              str += `\n ${name}${required === '1' ? '?' : ''}: string,`;
          });
          this.generateExportStr(interFaceName, str);
      }
      generateExportStr(interFaceName, str) {
          // 直接使用``输出的空格缩进有问题
          this.exportStr = `${this.KEY_WORD}interface ` + interFaceName + ' { '
              + str +
              '\n}\n\n' + this.exportStr;
      }
      /*  编译，将方法整合在一起,
       *  jsonObj:传入的对象主要的接口名，
       *  interfaceName: 初始值一般是接口名，驼峰命名
       *  compileType: 编译类型，因为后台返回的数据格式不同需要不同的遍历方式
      */
      compile(jsonObj, interfaceName, compileType, hasExport, apiName) {
          // 初始值
          this.exportStr = '';
          this.KEY_WORD = hasExport ? 'export ' : '';
          // 不同的数据类型有不同的转换方法
          switch (compileType) {
              case 'json_schema':
                  this.jsonSchemaToTsInterface(jsonObj, interfaceName);
                  break;
              case 'form':
              case 'query':
                  this.queryToTsInterface(jsonObj, interfaceName);
                  break;
              default:
                  const deepCloneObj = this.deepCloneToType(jsonObj);
                  this.formatToTsInterface(deepCloneObj, interfaceName);
                  break;
          }
          const resStr = `// ${apiName}-${this.API_URL}\n${this.exportStr}`;
          return resStr;
      }
  }

  // 插件显示的内容，需要内嵌在网页，所以采用appendChild
  class Content {
      constructor() {
          this.toTsCompile = new Compile(location.href);
      }
      // 生成页面元素
      createElementFun(options) {
          let $div = document.createElement(options.elem);
          $div.innerText = options.innerText || '';
          // @ts-ignore
          $div.classList = options.classList || '';
          $div.type = options.type || '';
          return $div;
      }
      // 页面加载时执行
      contentLoad(e) {
          const target = e.target;
          // 主体框
          const $btnWrapper = this.createElementFun({ classList: 'to-ts' });
          const $title = this.creatBtnWrapper();
          const $hasExportToggle = this.hasExportToggle();
          const $resBtn = this.createResBtn();
          const $bodyBtn = this.createBodyBtn();
          const $queryBtn = this.createQueryBtn();
          $btnWrapper.appendChild($title);
          $btnWrapper.appendChild($hasExportToggle);
          $btnWrapper.appendChild($resBtn);
          $btnWrapper.appendChild($bodyBtn);
          $btnWrapper.appendChild($queryBtn);
          target.body.appendChild($btnWrapper);
      }
      // 插件框标题
      creatBtnWrapper() {
          const $title = this.createElementFun({
              elem: 'h4',
              classList: 'to-ts-title',
              innerText: '接口转为ts interface'
          });
          return $title;
      }
      // 返回值转换按钮
      createResBtn() {
          const $resBtn = this.createElementFun({
              elem: 'button',
              classList: 'to-ts-res-btn',
              innerText: '返回值转换'
          });
          $resBtn.onclick = () => {
              this.clickCallBack($resBtn, 'resBtn');
          };
          return $resBtn;
      }
      // 是否生成export关键字
      hasExportToggle() {
          const $hasExportToggle = this.createElementFun({
              elem: 'input',
              type: 'checkbox',
              classList: 'has-export-toggle',
          });
          const $hasExportWrapper = this.createElementFun({
              elem: 'div',
              classList: 'has-export-wrapper',
              innerText: 'export关键字'
          });
          $hasExportWrapper.appendChild($hasExportToggle);
          $hasExportToggle.onclick = (e) => {
              this.hasExport = e.target.checked;
          };
          return $hasExportWrapper;
      }
      // Body参数按钮
      createBodyBtn() {
          // Body参数
          const $bodyBtn = this.createElementFun({
              elem: 'button',
              classList: 'to-ts-req-btn',
              innerText: 'Body参数转换'
          });
          $bodyBtn.onclick = () => {
              this.clickCallBack($bodyBtn, 'bodyBtn');
          };
          return $bodyBtn;
      }
      // 生成query参数按钮
      createQueryBtn() {
          // Query参数
          const $queryBtn = this.createElementFun({
              elem: 'button',
              classList: 'to-ts-query-btn',
              innerText: 'Query参数转换'
          });
          $queryBtn.onclick = () => {
              this.clickCallBack($queryBtn, 'queryBtn');
          };
          return $queryBtn;
      }
      // 按钮点击后回调，生成interface返回
      clickCallBack(element, type) {
          element.innerText = '转换中...';
          request().then((result) => {
              try {
                  result = JSON.parse(result).data;
                  const title = result.title; // 接口名称
                  const r = result[btnType[type].field];
                  const a = typeof r === "object" ? JSON.stringify(r) : r;
                  // 不能JSON.parse，因为存在注释, rollup强烈反对使用eval，用new Function代替
                  let resBody = new Function('return ' + a)();
                  let compileType = '';
                  // 老接口有.do，需要去掉
                  const splitPath = result.path.replace('.do', '').split('/');
                  // 获取接口名，生成的interface名跟接口名绑定
                  const apiPath = splitPath[splitPath.length - 1];
                  let interfaceName = apiPath;
                  // 如果接口存在-,则去掉，并变成驼峰命名
                  if (apiPath.indexOf('-') > -1) {
                      const arr = apiPath.split('-');
                      arr.forEach((item, index) => {
                          if (index > 0) {
                              arr[index] = firstUpperCase(item);
                          }
                      });
                      interfaceName = arr.join('');
                  }
                  // 返回值跟参数分开做处理
                  if (type === 'resBtn') {
                      if (result.res_body_is_json_schema) {
                          // 当res_body_type字段为json时取resBody.properties，为raw时不做处理，就是resBody
                          if (result.res_body_type === 'json') {
                              resBody = resBody.properties;
                              compileType = 'json_schema';
                          }
                      }
                  }
                  else if (type === 'bodyBtn') {
                      interfaceName += 'Body';
                      // post请求有两种，一种是form，一种是json,
                      if (result.req_body_type === 'form') {
                          resBody = result.req_body_form;
                          compileType = 'form';
                      }
                      else {
                          // json有两种，一种是res_body_is_json_schema为true，一种是false
                          if (result.req_body_is_json_schema) {
                              resBody = resBody.properties;
                              compileType = 'json_schema';
                          }
                      }
                  }
                  else if (type === 'queryBtn') {
                      interfaceName += 'Query';
                      compileType = 'query';
                  }
                  const value = this.toTsCompile.compile(resBody, interfaceName, compileType, this.hasExport, title);
                  copy(value);
                  element.innerText = btnType[type].innerText;
                  message({ text: '复制成功', type: 'success' });
              }
              catch (err) {
                  console.error(err);
                  element.innerText = btnType[type].innerText;
                  message({ text: `生成失败, 请检查是否有${btnType[type].innerText}`, type: 'error' });
              }
          });
      }
  }

  const content = new Content();
  document.addEventListener('DOMContentLoaded', function (e) {
      content.contentLoad(e);
  });

  return content;

})));
