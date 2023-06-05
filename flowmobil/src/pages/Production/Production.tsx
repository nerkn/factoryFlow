import axios from 'axios';
import { EventHandler, MouseEventHandler, SyntheticEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreateProduction from '../../components/dataHelpers/CreateProduction';
import * as dbTypes from '../../libs/types'
import { notificationStore } from '../../modules/stores/notification';
import { authStore } from '../../modules/stores/auth';
import { useApi } from '../../libs/utils';
 
function nodesOrder(starting:number[], all:dbTypes.processEdgeDb[]):number[]{
  let alltargets = all.filter(a=>starting.includes(parseInt(a.source))).map(a=>a.target).filter(a=>!starting.includes(parseInt(a))).map(a=>parseInt(a))
  if(alltargets.length){
    alltargets.forEach(at=>!starting.includes(at)?starting.push(at):'' )
    //starting.push(...alltargets)
    return nodesOrder(starting, all);  
  }
  return starting;
}


function Production(){
  let params                          = useParams<{productionId:string}>();
  let [nodesOrdered, nodesOrderedSet] = useState<number[]>([])
  let [production,  productionLoad]   = useApi<dbTypes.productionDb>((id:number)=>axios('/api/v1/production?where=id,eq,'+id))
  let [productionStep,  productionStepLoad]   = useApi<dbTypes.productionStepDb>((id:number)=>axios('/api/v1/productionStep?where=production,eq,'+id))
  let [process, processLoad]          = useApi<dbTypes.processDb>((id:number)=>axios('/api/v1/process?where=id,eq,'+id))
  let [processNode, processNodeLoad]  = useApi<dbTypes.processNodeDb>((id:number)=>axios('/api/v1/processNode?where=process,eq,'+id))
  let [processEdge, processEdgeLoad]  = useApi<dbTypes.processEdgeDb>((id:number)=>axios('/api/v1/processEdge?where=process,eq,'+id))
  let [products, productsLoad]  = useApi<dbTypes.productsDb>(()=>axios('/api/v1/products'))
  const user = authStore(s=>s.user)
  const notify = notificationStore(s=>({add:s.add}))

  
  useEffect(() => {
    console.log('params.productionId', params.productionId)
    productionLoad(params.productionId)
    productionStepLoad(params.productionId)
    productsLoad();
  }, [])
  useEffect(()=>{
    if(!production.length)
      return;
      console.log('production', production, production[0].process)
    processLoad(production[0].process)
    processNodeLoad(production[0].process)
    processEdgeLoad(production[0].process)
    }, [production])
  useEffect(()=>{
    if(!processEdge.length || !processNode.length)
      return;
    let targets = processEdge.map(p=>p.target)
    let nodeStarting = processNode.filter(pn=>!targets.includes(''+pn.id)).map(pn=>pn.id)
    if(!nodeStarting.length)
      return;
    nodesOrderedSet(nodesOrder(nodeStarting, processEdge));
  }
  ,[processEdge, processNode])
  function productionStepStart(nodeid:number){
    axios.post('/api/v1/productionStep',{process:process[0].id,
      production:production[0].id,
      processNode:nodeid, user:user.id,
      status:'waiting'}).then(e=>{
        productionStepLoad(params.productionId);
        notify.add(e.data.error?'Error':'Added!')
      })
  }
  function stepStatusSetApi(stepid:number, newStatus:string){
    if(newStatus == 'completed')
      axios.post('/api/v1/production', {
        id:production[0].id,  
        completedNodes:productionStep.filter(ps=>ps.status=='completed').length+1
      })
    axios.post('/api/v1/productionStep',{
      id    : stepid, 
      status: newStatus, 
      user  : user.id
     }).then(e=>{
      productionStepLoad(params.productionId)
      notify.add(e.data.error?'Error':'Changed')
    })
  }
  function stepStatusChange(
    stepid:number, 
    newStatus:string, 
    btnclass:string, 
    title:string){
    return <a className={'btn btn-outline btn-sm btn-'+btnclass} onClick={()=>stepStatusSetApi(stepid, newStatus)}>{title}</a>
  }
  let lastOneFinished = true;
  
  return <div>
    <div><h3>Process {process.map(p=>p.id)}</h3>

    <table className="table w-full">
    <thead>
      <tr>
        <th>
          <label>
            <input type="checkbox" className="checkbox" />
          </label>
        </th>
        <th>Step</th>
        <th>Product</th>
        <th>Status</th>
        <th>Action</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      {nodesOrdered.map((nodeid)=><tr>
        <td>{nodeid}</td>
        <td>{processNode.find(pn=>pn.id==nodeid)?.title}</td>
        <td>{processEdge.filter(pe=>parseInt(pe.source)==nodeid)?.map(pe=>products?.find(p=>p.id==pe.product)?.title).map(t=><li>{t}</li>)}</td>
        <td>{productionStep.find(pn=>pn.processNode==nodeid)?.status||'-'}</td>
        <td>{(()=>{
          let r=[];
          let step = productionStep.find(pn=>pn.processNode==nodeid)
          let previousNodeIds = processEdge.filter(pe=>parseInt(pe.target)==nodeid).map(pe=>parseInt(pe.source))
          let previousSteps = productionStep.filter(pn=>previousNodeIds.includes( pn.processNode))
          switch(step?.status){
            case'completed' : r.push(<span className='btn btn-info btn-sm'>completed</span>); break;
            case'producing' : r.push([
                stepStatusChange(step.id, 'completed', 'error',   'Complete'),
                stepStatusChange(step.id, 'waiting',   'info',    'Waiting'),
                stepStatusChange(step.id, 'cancelled', 'warning', 'Cancel')]);
                break;
            case 'waiting'  : r.push([
              stepStatusChange(step.id, 'completed',  'error',    'Complete'),
              stepStatusChange(step.id, 'producing',  'success',  'Produce'),
              stepStatusChange(step.id, 'cancelled',  'warning',  'Cancel')]);
                break;
            case 'cancelled':r.push([
              stepStatusChange(step.id, 'waiting',    'info',     'Waiting'),
              stepStatusChange(step.id, 'producing',  'error',    'Produce')]);
            case 'not started':
            default: 
              //r.push(<>{previousNodeIds.length +' | '+previousSteps.length}</>)
              if((previousNodeIds.length == previousSteps.length) 
                  && 
                  previousSteps.every(ps=>ps.status=='completed')){
                r.push(<a className='btn btn-outline btn-sm btn-info' onClick={()=>productionStepStart(nodeid)}>Start</a>)
              }else{
                r.push(<>Waiting: </>)
                r.push(previousSteps.map(ps=>ps.processNode))
                r.push(
                  previousNodeIds.filter(pnid=>!previousSteps.find(ps=>ps.id==pnid)).map(pnid=>processNode.find(pn=>pn.id==pnid)).map(pn=><li>{pn?.title}</li>))
              }
                
          }
          return r;
        })()}
        </td>
        
      </tr>
      )}
    </tbody>

    <tfoot>
      <tr>
        <th></th>
        <th>Step</th>
        <th>Product</th>
        <th>Status</th>
        <th>Action</th>
        <th></th>
      </tr>
    </tfoot>
    </table>
    
    </div>  
  </div>

}

export default Production;