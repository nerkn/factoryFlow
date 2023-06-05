import {createStore, create,  } from 'zustand';

type cachedStoreType = {
  cache:cacheType,
  hasValue:(key:string)=>boolean,
  getValues:(key:string)=>string|boolean
}
type cacheType = {
  [key: string]:  string,
}


const cachedStore = create<cachedStoreType>()(
  (set, get)=>({
  cache : {},
  hasValue: (key)=>get().cache.hasOwnProperty(key),
  getValues:(key)=>{
    console.log('cachedStore has key', key)
    let cache = get().cache;
    return cache.hasOwnProperty(key)?cache[key]:false;
  },
  setValues:(key:string, vals:string)=>set((s: cachedStoreType)=>{
    let cache = {  ...s.cache};
    cache[key] = vals;
    return cache;
  }),
  delValues:(key:string)=>set(s=>{
    delete s.cache[key];
    return {...s.cache}} )
  })
)

export default cachedStore;