## yapi-to-interface

项目引入ts之后，接口的返回值和参数也要有对应数据的interface定义，如果自己写太繁琐，而且容易出错，所以开发一个谷歌插件，利用递归遍历进行自动转换，支持嵌套数据
数据：

转换后：

```
// 接口地址
export interface CheckTransactionIdData {
  // 提示信息 
  errorMsg: string, 
  // 支付时间 
  payTime: number, 
  // 是否支付成功 
  success: boolean, 
  // 支付金额 
  totalAmount: number, 
  // 交易参考号 
  transactionId: string, 
} 

export interface CheckTransactionId {
  code: number, 
  data: CheckTransactionIdData, 
}
```

 


## 使用方式

####  1、引入资源
谷歌浏览器打开chrome://extensions/，  
然后把解压的dist文件夹直接拖过去，就能加载插件了。打开yapi具体接口页面，右边会出现个浮层，点击就可以进行转换了  
![image](https://photo.zastatic.com/images/common-cms/it/20220106/1641459812069_323645_t.jpg)

####   2、按钮功能

返回值转换：
返回值有两种格式，json字符串和json-schema，点击按钮转换为interface  
Body参数转换：
Body参数有三种格式，json字符串、json-schema、form，点击按钮转换为interface
Query参数转换：
Query参数只有一种格式，但是类型只能判断为string，点击按钮转换为interface



## 项目开发

#### 1、安装依赖
  npm install

#### 2、开发模式(监听代码变化，生成content.js)
  npm run dev

#### 3、编译(生成content.js，压缩版)
  npm run build

执行命令之后dist就是插件包


## 项目目录，注意及时更新

```
|—— src/                                     // 项目主要代码
|   |—— lib/                                 // 项目逻辑处理，核心代码目录
|   |   |—— compile.ts                       // 遍历转换
|   |   |—— content.ts                       // 页面注入元素进行交互
|   |   |—— request.ts                       // 接口获取数据
|   |—— public/                              // 谷歌插件的配置
|   |   |—— assets                           //  谷歌插件的图标
|   |   |—— manifest.json                    // 谷歌插件的配置
|   |   |—— style.css                        // 谷歌插件的样式
|   |—— types/                               // 项目接口interface定义目录
|   |   |—— index.ts                         // 项目接口interface定义，还有对应注解
|   |—— utils/                               // 项目工具类目录
|   |   |—— dict.ts                          // 项目字典枚举文件
|   |   |—— utils.ts                         // 项目工具类文件
|   |—— index.ts                             // 项目入口
|—— .babelrc                                 // babel配置文件
|—— .eslintrc.js                             // eslint配置文件
|—— .gitignore                               // git忽略配置文件
|—— package.json                             // package.json配置文件，包括项目依赖和打包命令
|—— rollup.config.js                         // rollup打包配置文件，不区分开发和生产环境
|—— tsconfig.json                            // ts配置文件
```

不断完善中，未完待续。。。

