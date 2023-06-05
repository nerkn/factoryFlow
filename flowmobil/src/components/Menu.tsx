import { FormEvent, SyntheticEvent, useRef } from "react";
import { authStore, authStoreType } from "../modules/stores/auth"
import { userType } from "../modules/types/user"



function MenuUser(){	
	let userStuff = authStore()
	let formElem = useRef()
	function loginSubmit(e:FormEvent<HTMLFormElement>):boolean{
		e.preventDefault();
		let elems  =[...(e.target as HTMLFormElement).elements] as HTMLInputElement[];	
    let k = elems.find(e=>e);	
    let userName  = elems.find(e=>e.name=='email')?.value
    let pass      = elems.find(e=>e.name=='password')?.value
    if(userName && pass)
		  userStuff.login( userName ,  pass)
		return false;
	}
	return <>
	<a>{userStuff.user.username??'Noname'} </a>
	{userStuff.user.id?<ul className="p-2 bg-base-200">
						<li><a href="/users/me">{userStuff.user.username}</a></li>
						<li><a onClick={()=>userStuff.logout()}>Logout</a></li>
					</ul>:<ul className="p-2 bg-base-100 shadow-xl z-10">
						<li>
							<form  onSubmit={loginSubmit} className=" hover:bg-base-100">
						<div className="w-64 ">
								<h2 className="card-title">Login!</h2> 
								<div className="form-control">
									<label className="input-group">
										<input name='email' defaultValue="" type="text" placeholder="info@site.com" className="input input-bordered" />
									</label>
								</div>
								<div className="form-control">
									<label className="input-group">
										<input name='password' type="password" defaultValue=""  className="input input-bordered" />
									</label>
								</div>
								<div className="form-control"> 
									<label className="input-group">
										<input value='Submit' type="submit"   className="input input-bordered" />
									</label>
								</div>
						</div>
							</form>
						</li>
					</ul>}

	</>
}





export default function Menu(){


	return <div className="navbar bg-white  ">
	<div className="flex-1">
	  <a className="btn btn-ghost normal-case text-xl">FlowMobil</a>
	</div>
	<div className="flex-none">
	  <ul className="menu menu-horizontal px-1 z-50">
		<li><MenuUser /></li>
		<li><a href="/">Kedi</a></li>
		<li tabIndex={0} >
		  <a>System</a>
		  <ul className="p-2 bg-white">
			<li><a href="/System/Designer">Designer</a></li>
			<li><a href="/System/Hierarchy">Hierarchy</a></li>
			<li><a href="/System/Employee">Employee</a></li>
			<li><a href="/Production/Overview">Production</a></li>
		  </ul>
		</li>

		<li tabIndex={1} className="z-50">
		  <a>Customer</a>
		  <ul className="p-2 bg-white">
			<li><a href="/Customer/Orders">Orders</a></li>
			<li><a href="/Customer/Customers">Customers </a></li>
			<li><a>Submenu 2</a></li>
		  </ul>
		</li>

	  </ul>
	</div>
  </div>
}