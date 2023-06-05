import axios from 'axios';
import { useEffect, useState } from 'react';
import * as dbTypes from '../../libs/types'

let ApiOrders     = ()=>axios('/api/v1/orders?orderby=production')
let ApiProducts   = ()=>axios(`/api/v1/products`)
let ApiOrderItems = (orderIds:string)=>axios(`/api/v1/orderItems?where=orderId,in,${orderIds}`)
let ApiCustomers  = (customers:string)=>axios(`/api/v1/customers?where=id,in,${customers} `)
let ApiProduction =  (production:string)=>axios(`/api/v1/production?where=orderId,in,${production} `)



function Overview(){
  let [orders,      ordersSet] = useState<dbTypes.ordersDb[]>([])
  let [products,    productsSet] = useState<dbTypes.productsDb[]>([])
  let [orderItems,  orderItemsSet] = useState<dbTypes.orderItemsDb[]>([])
  let [customers,   customersSet] = useState<dbTypes.customerDb[]>([])
  let [productions, productionsSet] = useState<dbTypes.productionDb[]>([])
  useEffect(() => {
    ApiOrders().then(r=>ordersSet(r.data.data))
    ApiProducts().then(r=>productsSet(r.data.data))
  }, [])
  useEffect(()=>{
    if(orders.length){
      ApiCustomers(orders.map(o=>o.customer).join(','))
        .then(r=>customersSet(r.data.data))
      ApiOrderItems(orders.map(o=>o.id).join(','))
        .then(r=>orderItemsSet(r.data.data))
    }

    }, [orders])
    useEffect(()=>{
      if(!orderItems.length)
        return;

      let orderIds;
      if(orderIds =orderItems.map(o=>o.id).join(',') )
        ApiProduction(orderIds)
          .then(r=>productionsSet(r.data.data))
    }, [orderItems])
  console.log('orders', orders)

  return <div>
    <div><h3>Orders</h3>
    {orders.map(o=><div className="card w-96 bg-base-100 shadow-xl m-2">
  <div className="card-body">
    <h2 className="card-title">{customers.find(c=>c.id==o.customer)?.username}</h2>
    <div>{o.createdAt} 
    
      <div className="badge badge-outline">{o.paymentStatus}</div>
      <a ></a>
    </div>

    </div>
    <table>
    {orderItems.filter(oi=>oi.orderId==o.id).map(oi=><tr key={oi.id}>
      <td>{products.find(p=>p.id==oi.product)?.title}</td>
          {productions.filter(p=>p.orderItem==oi.id)?.map(p=><><td>{p.createdAt.substring(0, 10)}</td> <td>{p.status}</td></>)||'-'}
        </tr>
        )}
    </table>
    <div className="card-actions justify-end">
      <a href={'/Production/Order/'+o.id} className="btn btn-primary">Order Production</a>
    </div>
</div>)}
    </div>
    <div><h3>Orders</h3></div>
  </div>

}

export default Overview;