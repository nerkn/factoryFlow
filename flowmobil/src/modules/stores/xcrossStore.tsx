import axios from 'axios';
import {createStore, create,  } from 'zustand';
import { xcrossDefDb, xcrossValuesDb } from '../../libs/types';


interface xcrossStoreState {
  defs: xcrossDefDbXType[],
  matrix: xcrossValuesDb[],
  loadDefs: ()=>void
  reloadMatrix:()=>void,
  getKeys: (xid:number, keys:number[])=>number[]
  getVals: (xid:number, vals:number[])=>number[]
  setVal: (xid:number, key:number, val:number)=>Promise<void>
  getValVals: (xid:number, vals:number[])=>  ({ id: number; title:string } | undefined)[]
}
type xcrossDefDbXType = xcrossDefDb & {
  paramsparsed:{
    table1:{column:string, value:string},
    table2:{column:string, value:string},
  },
  preloadedVals:{id:number,  title:string}[]
}


const xcrossStore = create<xcrossStoreState>()(
  (set, get)=>({
  defs : [],
  matrix:[],
  loadDefs:()=>{
    if(get().defs.length)
      return;
    axios('/api/v1/xcrossDef').then(r=>{
      let d:xcrossDefDbXType[] = r.data.data.map(
          (d: xcrossDefDbXType)=>({...d, paramsparsed:JSON.parse(d.params)})
          )
      Promise.allSettled(d.map(d=>
        axios(`/api/v1/${d.table2}?where=${d.paramsparsed.table2.column},eq,${d.paramsparsed.table2.value}`)
        .then(r=>{
          d.preloadedVals = r.data.data; 
          return d;
        }) ))
      //.then(a=>set({preloadedVals:a.map(a=>(a.status=='fulfilled')?a.value:'') }))

    })
    get().reloadMatrix();
  },
  reloadMatrix:()=>axios('/api/v1/xcrossVals').then(r=>{
    set({ matrix:r.data.data    })
  }),
  /* may be misleading naming */ 
  getKeys:(xid, keys)=>get().matrix.filter(m=>(m.x==xid)&&(keys.includes(m.t2))).map(m=>m.t1),
  /* may be misleading naming */ 
  getVals:(xid, vals)=>get().matrix.filter(m=>(m.x==xid)&&(vals.includes(m.t1))).map(m=>m.t2),
  setVal: async (xid, key,  val)=>{
    let g=get();
    let pv = g.defs.find(d=>d.id==xid);
    let k = get().matrix.find(m=>(m.x == xid) && (m.t1==key))

    return axios.post(`/api/v1/xcrossVals`, {id:k?.id, x:xid, t1:key, t2:val})
      .then(r=>get().reloadMatrix())
  },
  getValVals:(xid, vals)=>{
    let g=get();
    let pv = g.defs.find(d=>d.id==xid)?.preloadedVals || [];
    let vs = g.getVals(xid, vals).map(id=>pv.find(pv=>id==pv.id)) || []
    console.log('getValvals', vals, g.getVals(xid, vals), pv, vs)
    return vs
  }
}))

export default xcrossStore;