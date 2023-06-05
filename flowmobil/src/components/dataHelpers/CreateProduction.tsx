import axios from 'axios'
import { MouseEventHandler, useEffect, useState } from 'react'
import { processDb } from '../../libs/types'
import {formSubmit} from '../../libs/utils'

export default function CreateProduction({success, cancel, customer, orderId, orderItem }:{success:Function, cancel:MouseEventHandler<HTMLAnchorElement>, customer:string|number, orderId:string|number, orderItem:string|number}){
  let processesInitial:processDb[] = []
  let [processes, processesSet] =   useState(processesInitial)
  useEffect(()=>{
    axios('/api/v1/process?orderby=title').then(r=>processesSet(r.data.data))
  }, [])
  function createProduction(processId:number){
    axios.post('/api/v1/production', {process:processId, orderId:orderId, orderItem:orderItem, customer:customer,  status:'processing'}).then(r=>success())
  }
return <div className="modal CreateProductionModal">
    <div className="modal-box">
<h3>Create Product {customer}</h3>
{processes.map(p=>
  <a className='btn btn-outline btn-success w-1/2' onClick={()=>createProduction(p.id)}> {p.title}</a>
  )} 
<div className="w-full "> 
  <a   className="btn btn-error  "   onClick={cancel}>Cancel</a>
</div>
</div>

</div>
}