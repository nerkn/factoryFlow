import axios from "axios";
import { FormEvent, FormEventHandler, useState } from "react"

type FormEventds=FormEvent<HTMLFormElement> & {
  target:HTMLElement&{
    action:string,
    elements:HTMLInputElement[]
  }
}
export function formSubmit(callback=console.log, error=()=>{}) {
  return (event:FormEventds) => {
    event.preventDefault();
    console.log('formSubmitting', event);
    let emptyRec : Record<string, any> = {}
    axios.post(event.target.action , [...event.target.elements].reduce((a,e)=>{
      if(e.name)
        a[e.name as string]=e.value; 
      return a
    }, emptyRec)).then(callback).catch(error)
  }
}




export function useApi<T>(apiGetter:Function):[T[], Function] {
  let [datas, datasSet] = useState([])
  function datasLoad(params:any){
    console.log('params', params)
    if(typeof params == 'object'){
      apiGetter(...params).then((r:any)=>datasSet(r.data.data))
    }else{
      apiGetter(params).then((r:any)=>datasSet(r.data.data))
    }
  }
  return [datas, datasLoad]
}
