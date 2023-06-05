import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreateProduction from '../../components/dataHelpers/CreateProduction';
import * as dbTypes from '../../libs/types'

let ApiOrder      = (id:string|undefined)=>axios('/api/v1/orders?where=id,eq,'+id)
let ApiOrderItems = (id:string)=>axios('/api/v1/orderItems?where=orderId,eq,'+id)
let ApiOrderNotes = (id:string)=>axios('/api/v1/orderNotes?where=id,eq,'+id)
let ApiCustomers  = (customers:string)=>axios(`/api/v1/customers?where=id,in,${customers} `)
let ApiProduction =  (order:string)=>axios(`/api/v1/production?where=orderId,eq,${order} `)
let ApiProducts   =  (productIds:string)=>axios(`/api/v1/products?where=id,in,${productIds} `)




function Order(){
  let params:{orderId?:string}          = useParams<{orderId:string}>();
  let [orders,          ordersSet]      = useState<dbTypes.ordersDb[]>([])
  let [orderItems,      orderItemsSet]  = useState<dbTypes.orderItemsDb[]>([])
  let [orderNotes,      orderNotesSet]  = useState<dbTypes.orderNotesDb[]>([])
  let [customers,       customersSet]   = useState<dbTypes.customerDb[]>([])
  let [productions,     productionsSet] = useState<dbTypes.productionDb[]>([])
  let [products,        productsSet]    = useState<dbTypes.productsDb[]>([])
  let [orderItem,       orderItemSet]     = useState<dbTypes.orderItemsDb['id']>()
  let [productionSteps, productionStepSet]= useState()
  function modalToggle(openclose:number){
    let cls = document.querySelector(".CreateProductionModal")?.classList;
    (openclose)?cls?.add('modal-open'):cls?.remove('modal-open')
  }
  useEffect(() => {
    if(!params.orderId)
      return

    ApiOrder(params.orderId).then(r=>ordersSet(r.data.data))
    ApiOrderItems(params.orderId).then(r=>orderItemsSet(r.data.data))
    ApiOrderNotes(params.orderId).then(r=>orderNotesSet(r.data.data))
    ApiProduction(params.orderId).then(r=>{
      //let ps:string = r.data.data.map(p=>p.id).join(',')
      //axios('/api/v1/productionStep?where=production,in,ps').then(r=>r.data)
      productionsSet(r.data.data)
    })
  }, [])
  useEffect(()=>{
    if(orders.length)
      ApiCustomers(orders.map(o=>o.customer).join(','))
        .then(r=>customersSet(r.data.data)) 
    }, [orders])
  useEffect(()=>{
    if(orderItems.length)
      ApiProducts(orderItems.map(o=>o.product).join(','))
        .then(r=>productsSet(r.data.data)) 
    }, [orderItems])

  console.log('orders', orders)

  return <div>
    <div><h3>Order {orders.map(o=>o.id)}</h3>

    <table className="table w-full">
    <thead>
      <tr>
        <th>
          <label>
            <input type="checkbox" className="checkbox" />
          </label>
        </th>
        <th>Date</th>
        <th>Product</th>
        <th>Process</th>
        <th></th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      {orderItems.map((oi,i)=><tr>
        <td>{i+1}</td>
        <td>{products.find(p=>oi.product==p.id)?.title}</td>
        <td>{productions.find(p=>p.orderItem==oi.id)?.updatedAt}</td>
        <td>{productions.find(p=>p.orderItem==oi.id)?.status}</td>
        <td>
          {productions.find(p=>p.orderItem==oi.id)?
          <a className='btn btn-secondary' href={'/Production/Production/'+productions.find(p=>p.orderItem==oi.id)?.id} >Open Process</a>:
          <a onClick={()=>{orderItemSet(oi.id);modalToggle(1); }} className="btn btn-accent">Create Process</a>}
        </td>
      </tr>
      )}
    </tbody>

    <tfoot>
      <tr>
        <th></th>
        <th>Product</th>
        <th>Process</th>
        <th></th>
        <th></th>
      </tr>
    </tfoot>
    </table>
    
    </div> 
    <CreateProduction 
      orderId={params.orderId||0} 
      customer={orders.find(()=>true)?.customer || 0} 
      orderItem={orderItem||0}

      success={()=>{
        if(!params.orderId)
          return 
        ApiOrderItems(params.orderId).then(r=>orderItemsSet(r.data.data));
        modalToggle(0);
      }}
      cancel ={()=>modalToggle(0)}
     />
  </div>

}

export default Order;