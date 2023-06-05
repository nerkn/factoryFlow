import {createStore, create,  } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import {userType, guest} from '../types/user';
import axios from 'axios'; 
import { notificationStore } from './notification';



interface authStoreType{
	id: number,
	login(email:string, password:string):void,
	logout():void,
	user:userType,
	token:string,
  error:string
}


//let notif = notificationStore();
const authStore = create<authStoreType>()( 
  persist(
	(set, get)=>({
	id:0,
	token:'',
  error:'',

	login:(email, password) 	=> axios.post('/api/signin', {email:email, password:password }).
										then(r=>{
											console.log("login cevabi", r.data);
											if (!r.data.error) {
                        let u = r.data.data
                        set({user:r.data.data})
                      } else {
                        set({error:r.data.error})
                      }
											
										}).catch(console.log),
	logout:()					=> set(({user:guest})),
	signup:()					=> axios.post('/api/signup' ).
										then(r=>set(({user:r.data}))).catch(console.log),
	user: {id:'', company:0, companyName:'NA', username:'Guest', roles:''}

 }),
 {
   name: 'userLogin', // name of the item in the storage (must be unique)
   storage: createJSONStorage(() => sessionStorage), 
 }
 ));

export { authStore };
export type { authStoreType };
