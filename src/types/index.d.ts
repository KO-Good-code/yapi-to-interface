// 创建element元素
export interface CreateElement {
  // 元素类型
  elem?: any,
  // 文字       
  innerText?: string,
  // 样式 
  classList?: string, 
  // 类型 
  type?: string, 
}

// 按钮类型字典
export interface BtnType {
  // 任意属性
  [key: string]: {
    // 字段名
    field: string,
    innerText: string,
  }
}