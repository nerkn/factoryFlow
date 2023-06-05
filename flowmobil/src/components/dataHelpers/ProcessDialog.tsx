import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { processDb,  processEdgeDb, processNodeDb, ServerResponse, ServerResponseSuccessfulInsertUpdate } from "../../libs/types";
import { formSubmit, useApi } from "../../libs/utils";
import { notificationStore } from "../../modules/stores/notification";
import t from '../../libs/translate'


/**
 * Create Clone Rename Delete Select
 */
function ProcessDialog({selCB, opened, closer}:
  {selCB:Function, opened:boolean, closer:Function}){

  const notify = notificationStore(s=>({add:s.add}))
  const [processes, processesLoad] = useApi<processDb>(()=>axios('/api/v1/process'))
  useEffect(()=>{if(opened)processesLoad()},[opened])
  const [renameDiaOpen,     renameDiaOpenSet]    = useState<boolean>(false);
  const [renameDiaProcess,  renameDiaProcessSet] = useState<processDb>();
  async function ActionClone(process:processDb){
    let newProcess = {
      ...process, 
      id:null, 
      CreatedAt: new Date().toJSON().replace('Z', '') }
    let result = await axios.post('/api/v1/process', newProcess );
    if((result.statusText != 'OK') && result.data.error ){
      return notify.add('Error');
    } 
    let newId = result.data.data[0].insertId;
    let oldEdges:processEdgeDb[], oldNodes:processNodeDb[];
    Promise.allSettled([
      axios(`/api/v1/processEdge?where=process,eq,${process.id}`),
      axios(`/api/v1/processNode?where=process,eq,${process.id}`),
    ]).then(results=>{
      if((results[0].status == "rejected") || (results[1].status == "rejected"))
        return notify.add('Some error while servering') ;
      
      let oe  = results[0].value as AxiosResponse<ServerResponse<processEdgeDb[]>>;
      oldEdges =oe.data.data.map(e=>({...e, 
        process:newId,  
        createdAt: new Date().toJSON().replace('Z', ''),
        updatedAt: new Date().toJSON().replace('Z', '') 
      }));
      
      oldNodes=results[1].value.data.data.map((e:processEdgeDb)=>({...e, process:newId, 
        CreatedAt: new Date().toJSON().replace('Z', ''),
        UpdatedAt: new Date().toJSON().replace('Z', ''),}))
    Promise.allSettled([
      axios.post(`/api/v1/multi/processEdge`,
          oldEdges.map(e=>({...e, id:undefined}))),
      axios.post(`/api/v1/multi/processNode`,
          oldNodes.map(e=>({...e, id:undefined})))
    ]).then(r=>{
        if((r[0].status == 'rejected') || (r[1].status == 'rejected'))
          return notify.add('Some error while servering 2') ;
        let nEdges = r[0].value.data.data.map((e:ServerResponseSuccessfulInsertUpdate,i:number)=>e.insertId)
        let nNodes:number[] = []
        r[1].value.data.data.forEach((e:ServerResponseSuccessfulInsertUpdate,i:number)=>nNodes[oldNodes[i].id]= e.insertId)
        console.log('r[1].value.data.data', r[1].value.data.data)
        console.log(nEdges, nNodes)
        let newEdges = oldEdges.map((e,i)=>({...e, id:nEdges[i], 
          source:nNodes[parseInt(e.source)],
          sourceHn:e.sourceHn.replace(e.source+'-', nNodes[parseInt(e.source)]+'-'),
          target:nNodes[parseInt(e.target)],
          targetHn:e.targetHn.replace(e.target+'-', nNodes[parseInt(e.target)]+'-')
          }))
          axios.post(`/api/v1/multi/processEdge`, newEdges)

          notify.add('Added! ')

          processesLoad()

            })
    })
  }
  function ActionDelete(process:processDb){
    axios(`/api/v1/production?where=process,eq,${process.id}`).then(r=>{
      if(r.data.data.length){
        console.log('delete ', r.data.data)
        notify.add('deleting?')
      }else{

      }
      
    })
  }


  return <><dialog  open={opened}  className="modal-box w-11/12 max-w-5xl">
    <div className="w-full flex flex-col ">
    <h3>Processes</h3>
    <table className="grow">
      <thead className="sticky top-0">
        <tr>
          <th>Title</th>
          <th>Nodes</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody className=" overflow-y-auto">
    {processes.map(process=><tr key={process.id} className="hover:bg-gray-100">
        <td><a className="btn btn-sm   btn-ghost w-full" onClick={()=>selCB(process)}> {process.title}</a></td>
        <td>{process.nodeCount}</td>
        <td>{process.CreatedAt.replace('T', ' ').substring(0,16)}</td>
        <td>
          <a className="btn btn-sm btn-outline btn-info" onClick={()=>ActionClone(process)}>{t('Clone')}</a>
          <a className="btn btn-sm btn-outline btn-success" onClick={()=>{renameDiaOpenSet(true); renameDiaProcessSet(process)}}>{t('Rename')}</a>
          <a className="btn btn-sm btn-outline btn-error" onClick={()=>ActionDelete(process)}>{t('Delete')}</a>
          </td>
        </tr>)}

    </tbody>
    </table>
    <div className="p-4 ">
      <a onClick={()=>closer(false)} className='btn btn-sm btn-outline btn-info w-1/2'>Close</a>
    </div>
    </div>
    </dialog>
    <dialog open={opened && !!renameDiaOpen} className='z-10 border shadow rounded-md'>
      <form onSubmit={()=>formSubmit(()=>processesLoad())&&renameDiaOpenSet(false)} action='/api/v1/process' className="flex flex-col" key={renameDiaProcess?.id}>
        <h3 className="pb-4">Change Name</h3>
      <input type='hidden' name='id' value={renameDiaProcess?.id} />
      <input defaultValue={renameDiaProcess?.title} name='title' className="input input-bordered w-full"/>
      <div className="py-4">
      <input type='submit' value={t('Save')} className='btn btn-sm btn-outline btn-success' />
      <input onClick={()=>renameDiaOpenSet(false)} value={t('Close')}  className='btn btn-outline btn-sm btn-error'/>
      </div>
      </form>

    </dialog>
    </>




}

export default ProcessDialog;
