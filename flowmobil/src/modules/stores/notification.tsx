import {createStore, create} from 'zustand';


interface notificationOne{
	msg:string,
	end:number
}

interface notificationStoreType{
	notifications:notificationOne[],
	add(msg:string, end?:number):void,
	length():number,
	trigger():void
}
 
 


const notificationStore = create<notificationStoreType>()((set, get)=>({
	notifications:[],
	add:(msg, end=1)=> {
    let endTime = new Date().getTime() + end*1000;
		let no:notificationOne = {msg:msg, end: endTime };
		set(s=>({notifications :  [...s.notifications, no] }))
    setTimeout(()=>set(ns=>({notifications:ns.notifications.filter(n=>n.end!=endTime)})), end*1000)
	},
	length:()=>{
		return get().notifications.length;
	},
	trigger:()=>{
		let notifs = get().notifications
		if(notifs.length==0)
			return;
		let now = new Date().getTime()
		if(notifs[0].end>now){
			notifs.shift()
			set(s=>({notifications:notifs}))
		}
	}
 }))
 export  {notificationStore};