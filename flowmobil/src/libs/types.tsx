import { FormEvent, SyntheticEvent } from "react";

type customerDb = {
  id: number;
  username: string;
};
type orderItemsDb = {
  id: number;
  orderId: ordersDb["id"];
  product: productsDb["id"];
  quantity: number;
  unit: string;
  status: "producing" | "ready";
};
type orderNotesDb = {
  id: number;
  orderId: ordersDb["id"];
  title: string;
  msg: string;
  createdAt: StringDate;
  user: number;
  importance: "none" | "alittle" | "urgent" | "important";
};
type ordersDb = {
  id: number;
  customer: number;
  production: productionDb["id"];
  paymentStatus: "All paid" | "Instalment" | "Waiting";
  createdAt: StringDate;
  updatedAt: StringDate;
};
type processDb = {
  id: number;
  project: number;
  title: string;
  nodeCount:number;
  CreatedAt: StringDate;
  UpdatedAt: StringDate;
  status: "cancelled" | "workable" | "archived" | "new";
};
type processEdgeDb = {
  id: number;
  process: number;
  source: string;
  sourceHn: string;
  target: string;
  targetHn: string;
  product: productsDb["id"];
  quantity: number;
  unit: QuantityUnitType;
};
type processNodeDb = {
  id: number;
  process: number;
  title: string;
  additionalData: string;
  sort: number;
};
type productionDb = {
  id: number;
  process: processDb["id"];
  orderId: ordersDb["id"];
  orderItem: orderItemsDb["id"],
  completedNodes:number,
  customer: number;
  createdAt: StringDate;
  updatedAt: StringDate;
  status: "processing" | "completed" | "failed" | "cancelled";
};
type productionStepDb = {
  id: number;
  process: processDb["id"];
  production: productionDb["id"];
  processNode: processNodeDb["id"];
  status:
    | "completed"
    | "producing"
    | "waiting"
    | "not started"
    | "passed"
    | "cancelled";
};
type productsDb = {
  id: number;
  title: string;
  type: "raw material" | "semi product" | "product";
};
type HierarchyDb = {
  id: number;
  title: string;
  root: number;
  up: number;
};
type xcrossDefDb = {
  id: number;
  title: string;
  desc: string;
  table1: string;
  table2: string;
  params: string;
};
type xcrossValuesDb = {
  id: number;
  x: number;
  t1: number;
  t2: number;
  ps: string;
};


const  QuantityUnit =["cm" , "m", "mm", "cm", "m2", "cm2", "gr", "kg", "lt", "ml", "unit"]  ;


type QuantityUnitType = typeof QuantityUnit; 
type StringDate= string;

type ServerResponse<T> ={
  data:T,
  error:number,
  msg?:string
} 
type ServerResponseSuccessfulInsertUpdate ={
  insertId:number
}
type FormSubmitEvent= SyntheticEvent<HTMLFormElement, SubmitEvent> & {
  nativeEvent:{submitter:HTMLInputElement},
  target:{
    elements:HTMLInputElement[]
  }
}

export {QuantityUnit}
export type {
  customerDb,
  HierarchyDb,
  orderItemsDb,
  orderNotesDb,
  ordersDb,
  processDb,
  processEdgeDb,
  processNodeDb,
  productionDb,
  productionStepDb,
  productsDb,
  xcrossDefDb,
  xcrossValuesDb,

  QuantityUnitType,
  FormSubmitEvent,
  ServerResponse,
  ServerResponseSuccessfulInsertUpdate
};
