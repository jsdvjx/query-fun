import { Dayjs } from 'dayjs';

import QueryFun from '@jsdvjx/query-fun'


export type GetMemberParameter = void; 

export type GetMemberResult = {
  id : number;
  accid : string;
  username : string;
  password : string;
  nickname : string;
  email : string;
  mobile : string;
  gender : number;
  realname : string;
  license_type : number;
  license_img_back : string;
  license_img_front : string;
  is_license : number;
  license_code : string;
  license_expired_at : Dayjs;
  score : number;
  avatar : string;
  signature : string;
  area_code : number;
  area : string;
  province : string;
  city : string;
  address : string;
  salt : string;
  status : number;
  payment_pwd : string;
  credit : number;
  recommend_code : string;
  rec_member_id : number;
  is_authorization : number;
  authorization_at : Dayjs;
  recommand_at : Dayjs;
  expired_at : Dayjs;
  created_at : Dayjs;
  updated_at : Dayjs;
  agent_level_id : number;
  member_level_id : number;
  agent_rule_id : number;
  reset_pwd_time : Dayjs;
  lv_money : string;
  purchase_money : string;
  return_money : string;
  award_money : string;
  security_mode : number;
  optimistic_lock : number;
  golden_pound_number : string;
  is_days_group : number;
  zhanggui_theme_id : number;
  agent_shop_theme_id : number;
  service_package : number;
  is_edited_nickname : number;
  is_edited_gender : number;
  is_star : number;
  is_click_star : number;
  wechat_id : string;
  wechat_qrcode : string;
  user_global_id : number;
  sync_wk_status : number;
}[]


export type Members = {
  name : string;
  nickname : number;
  group : string;
  age : number;
  created_at : Dayjs;
}


export type InsertMemberParameter = {
  table : string;
  members : Members[];
}



export type InsertMemberResult = number; 


export type GetOrdersParameter = Dayjs; 

export type GetOrdersResult = {
  id : number;
  trade_no : string;
  member_id : number;
  coupon_money : string;
  coupon_limit : string;
  price : string;
  pay_price : string;
  receiver_name : string;
  receiver_mobile : string;
  receiver_address : string;
  receiver_province : string;
  receiver_city : string;
  receiver_area : string;
  area_code : string;
  type : number;
  remark : string;
  status : number;
  wholesale2_price : string;
  refund_reason : string;
  pay_type : number;
  pay_at : Dayjs;
  factory_price : string;
  product_num : number;
  created_at : Dayjs;
  updated_at : Dayjs;
  deleted_at : string;
  optimistic_lock : number;
  task_process_status : string;
}[]


export interface IMember extends Record<string,any> {

  getMember :{
    PARAMETER: GetMemberParameter;
    RESULT: GetMemberResult;
  }
  insertMember :{
    PARAMETER: InsertMemberParameter;
    RESULT: InsertMemberResult;
  }
}

export interface IOrder extends Record<string,any> {

  getOrders :{
    PARAMETER: GetOrdersParameter;
    RESULT: GetOrdersResult;
  }
}

export type Package = { member : IMember; order : IOrder; };
const QueristGenerater = QueryFun.build<Package>(
  [`member`,`order`],
  `query`,
);
export default QueristGenerater;

