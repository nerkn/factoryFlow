import axios from "axios";
import { FormEvent, SyntheticEvent, useEffect, useRef, useState } from "react"
import { customerDb, FormSubmitEvent } from "../../libs/types";
import cachedStore from "../../modules/stores/cachedStore";
import xcrossStore from "../../modules/stores/xcrossStore";

type searchParams = {
  [key: string]:  string,
}


function Employee(){
  let xcross                    = xcrossStore(s=>s); 
  let [searchResultsCombining, searchResultsCombiningSet] =useState<searchParams>({})
  let [searchResults,          searchResultsSet]    = useState<customerDb[]>()
  let [xcrossDialogOpen,       xcrossDialogOpenSet] = useState(false)
  let [xcrossDiaParams,        xcrossDiaParamsSet]  = useState([0,0])
  let searchFormRef = useRef(null);
  let cache = cachedStore()
  useEffect(() => { 
    xcross.loadDefs();
  }, []) 
  useEffect(()=>{
    if(!searchResultsCombining)
      return;
    let searchArray:number[] = []
    for(let i in searchResultsCombining){
      if(searchArray.length){
        if(searchResultsCombining[i].length){
        searchArray = searchArray.filter(sa=>searchResultsCombining[i].includes(''+sa))
        }
      }else{
        searchArray = [parseInt(searchResultsCombining[i])];
      }
    }
    (searchArray.length)?axios(`/api/v1/customers?where=id,in,${searchArray.join(',')}`).then(r=>searchResultsSet( r.data.data)):searchResultsSet([])
  },[searchResultsCombining])

  function change (e:SyntheticEvent){
    let form =(e.target as HTMLInputElement).form;
    ([...form!.elements] as HTMLInputElement[]).filter(e=>e.name).map(e=>{
      console.log(e.name, e.value)
      if(!e.value){
        searchResultsCombiningSet(s=>{
          let newState:searchParams = {...s}; 
          newState[e.name] = ''
          return newState;
          })
          return ;
      }
      let key = e.name+'|'+e.value
      if(cache.hasValue(key)){
        return cache.getValues(key)
      }
      if(e.name.startsWith('xcrossDef')){
        let xid = parseInt(e.name.replace('xcrossDef-',''))
        searchResultsCombiningSet(s=>{
          let r = xcross.getKeys(xid, [parseInt(e.value)])
            console.log('searchResultsCombiningSet', e.name, r, )
            let newState = {...s}; 
            newState[e.name] =''+r
            return newState;
          })
      }
      if(e.name == 'name'){
        axios('/api/v1/customers?where=username,like,'+e.value)
          .then(r=>searchResultsCombiningSet(s=>{
              let newState = {...s}; 
              newState[e.name] =r.data.data.map((r:customerDb)=>r.id) 
              return newState;
        }))
      }
    })
    

  }
  console.log('xcross.defs', xcross.defs)
  function xcrossOpenDialog(xid:number, valId:number){
    xcrossDialogOpenSet(true);
    xcrossDiaParamsSet([xid,valId])
  }
  function xcrossDialogSubmit(e:FormSubmitEvent ){
    e.preventDefault()
    if(e.nativeEvent.submitter?.value == 'Close'){
      xcrossDialogOpenSet(false);
      return;
    }
      
    console.log('xcrossDialogSubmit', e, e.target.elements)
    let t:{[key:string]:string} = {xid:'', key:'', val:''};
    [...e.target.elements].map(e=>{t[e.name] = e.value});
    xcross.setVal (parseInt(t.xid), parseInt(t.key), parseInt(t.val)) .then(()=>xcrossDialogOpenSet(false))

  }
  return <>
  <form ref={searchFormRef} className="UserSearchForm flex">{xcross.defs.filter(x=>x.table1=='customers').map(h=><div>
      <label className="mx-2">{h.title}</label>
      <select name={'xcrossDef-'+h.id} onChange={change} className="select select-bordered select-sm"><option></option>{h.preloadedVals.map(hp=><option value={hp.id}>{hp.title}</option>)}</select>
      </div>)}
    <div>
      <label  className="mx-2">Name</label>
      <input onChange={change} name='name' className="input input-bordered input-sm" />
    </div>
    <div> 
      <input onClick={change} value='search' type='button' className="input input-info input-sm" />
    </div>
  </form>
  <table className="table w-full">
    <tbody>
  {searchResults?.map(s=><tr>
    <td>{s.id}</td>
    <td>{s.username}</td>
    <td>{xcross.defs.map(d=>xcross.getValVals(d.id, [s.id]).map(d=>d?<span  className="btn btn-outline btn-success btn-xs" >{d.title}</span>:''))}</td>
    <td>{xcross.defs.map(d=><a  className="btn btn-outline btn-success btn-xs" title={d.title} onClick={()=>xcrossOpenDialog(d.id, s.id )}>{'+'}</a>) }</td>
    </tr>)}
    </tbody>
  </table>
  <dialog  open={xcrossDialogOpen} className="modal-box">
    {xcross.defs.filter(d=>d.id==xcrossDiaParams[0]).map(d=><>
      <h3>{d.title}</h3>
    <form method="post" action='' onSubmit={xcrossDialogSubmit} className="flex flex-col">
      <input type="hidden"    name="xid" value={d.id} />
      <input type="hidden"    name="key" value={xcrossDiaParams[1]} />
      <select className="select" multiple={true} name="val" size={10} >
        <option></option>
        {d.preloadedVals.map(hp=><option selected={xcross.getVals(d.id, [xcrossDiaParams[1]]).includes(hp.id)} value={hp.id}>{hp.title}</option>)}
      </select>
      <div className="w-full">
        <input className="btn btn-outline btn-success" 
          value="Save" type="submit"  />
        <input className="btn btn-outline btn-error"   
          value="Close" type="submit"  formMethod="dialog" />
      </div>
    </form>
    </>
      )}
    
  </dialog>
  </>
  
  


}
export default Employee;