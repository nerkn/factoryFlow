
export interface ElementType{
	Id:number,
	Title:string
}

export interface processType{
	id:number,
	Title:string,
	CreatedAt:Date,
	UpdatedAt:Date,
  productsInput:string,
  productsOutput: string,
	Elements: ElementType[]
}
export type Node = {
  id:NodeId,
  type?:string|undefined,
  data:NodeData,
  position:{x:number,y:number}
  width:number,
  height:number
}
export type NodeDb={
  id:NodeId
  process:number,
  title:string,
  additionalData:string,
  sort:number
}
export type EdgeDb={
  id:number,
  process:number,
  source: string,
  sourceHn:string,
  target:string,
  targetHn:string,
  product: ProductDb["id"],
  quantity:number,
  unit: QuantityUnit,

}
export  type Edge = {
  id:string,
  data:EdgeData,
  label:string,
  source:NodeId,
  sourceHandle:Handleid,
  target:NodeId,
  targetHandle?:Handleid
 }
export type NodeData = {
  Title:string,
  outputs:(NodeInOut|Edge)[],
  inputs:NodeInOut[],
}
export type NodeInOut ={ 
  id:Handleid,
  process :DbId, 
  product : DbId,
  quantity: number, 
  source:DbId,
  sourceHn:Handleid,
  unit:QuantityUnit
  data?:EdgeData
}
export type EdgeAndNodeInOut = Edge & NodeInOut;
export type EdgeData = {
  product:DbId,
  quantity:number,
  unit:QuantityUnit}
export type ProductDb= {
  id:number,
  title:string,
  type:"raw material"|"semi product" | "product"
}
export type Handleid = string;
export type NodeId   = string;
export type DbId = number|string;
export type QuantityUnit="cm"|"m"|"mm"|"m2"|"cm2"|"gr"|"kg"|"lt"|"ml"|"unit";