// 数据字典，枚举
import { BtnType } from '../types/index'

export const btnType: BtnType = {
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
}