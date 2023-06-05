import axios from 'axios';
import { useEffect, useState } from 'react';
import * as dbTypes from '../../libs/types'
import { formSubmit, useApi } from '../../libs/utils';



function HierarchialEditButtons({branch, upid=0, selectedIds=[], branchSelect,createNewBranch}:{branch:dbTypes.HierarchyDb[], upid:number,      selectedIds:number[], branchSelect:Function, createNewBranch:Function}){
    if(!branch.length)
      return <>{upid} NA</>
    let subBranch = branch.filter(b=>(b.up==upid)&&(!selectedIds.includes(b.id)) )
    let pselectedIds= [...selectedIds,  ...subBranch.map(s=>s.id)]
    //let unSelectedBranch = branch.filter(b=>subBranch.every(s=>s.id==b.id))
    
    return <>{subBranch.map(b=><div className='ml-1  border-l-1 border-l-2  border-teal-100 border-solid ' key={b.id}>
      <div className='flex'>
      <a className='grow pl-1 link link-hover' onClick={()=>branchSelect(b)}>{b.title}</a>
      <a className='rounded-full border-2 border-indigo-100 border-solid text-center px-1' onClick={()=>createNewBranch(b.root, b.id)} >+</a>
      </div>
      <HierarchialEditButtons 
        key={b.id}
        branch={branch.filter(u=>!pselectedIds.includes(u.id))}
        upid={b.id}
        selectedIds={pselectedIds}
        branchSelect={branchSelect}
        createNewBranch={createNewBranch}
        />
      
      </div>
      )}
      
      </>
}

function Hierarchy(){
  let [rootHierarchy, rootHierarchyLoad] = useApi<dbTypes.HierarchyDb>(()=>axios('/api/v1/hierarchy?where=root,eq,0'));
  let [hierarchySelected, hierarchySelectedSet] = useState({id:0})
  let [branchSelected, branchSelectedSet] = useState<dbTypes.HierarchyDb>({id:0, 
    title:'',	
    root:0,
    up:0})
  let [oneHierarchy, oneHierarchyLoad] = useApi<dbTypes.HierarchyDb>((root:number)=>axios('/api/v1/hierarchy?where=root,eq,'+root));
  useEffect(()=>{
    rootHierarchyLoad();
  },[])
  useEffect(() => {
    oneHierarchyLoad(hierarchySelected.id)
  }, [hierarchySelected])
  
  let submit = formSubmit(()=>{oneHierarchyLoad(hierarchySelected.id)})
  function createNewBranch(root:number, up:number){
    axios.post('/api/v1/hierarchy', {root:root, title:'New Branch', up:up }).then(r=>{console.log(r.data);oneHierarchyLoad(root)})
  }
  console.log('branchSelected', branchSelected)
  return <div className='flex'>
    <div className='w-20em  text-left'>
      <h3>Roots</h3>
      {rootHierarchy.map(r=><a onClick={()=>hierarchySelectedSet(r)} className={'btn btn-outline '+ ((r.id==hierarchySelected?.id)?'btn-accent':'btn-info')}>{r.title}</a>)}
      <div>
        <h3>Selected Root</h3>
        <div>
          <HierarchialEditButtons 
            key={hierarchySelected.id}
            branch={oneHierarchy}
            upid={hierarchySelected.id}
            selectedIds={[]}
            branchSelect ={branchSelectedSet}
            createNewBranch={createNewBranch}
            />
        </div>
      </div>
    </div>
    <div className=''>
      <form action='/api/v1/hierarchy' onSubmit={submit} key={branchSelected.id} className="p-4">
        <input name='id' value={branchSelected.id} type='hidden' />
        <input name='root' value={branchSelected.root} type='hidden' />
        <div className='form-control	'>
          <input name='title' className='input input-bordered' defaultValue={branchSelected.title} /></div>
        <div className='form-control	'>
          <select className='select input-bordered' name='up' defaultValue={branchSelected.up}><option value={branchSelected.root}></option>{oneHierarchy.map(o=><option value={o.id}>{o.title}</option>)}</select></div>
        <div className=''>
          <input type='submit' className='btn btn-outline btn-success w-1/2' />
          <a   className='btn btn-outline btn-error 	w-1/2' onClick={console.log}>Delete</a>
        </div>
      </form></div>
  </div>
}
export default Hierarchy;