import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Menu from "./components/Menu";
import Index from './pages/Index';
import Designer              from './pages/System/Designer';
import Hierarchy             from './pages/System/Hierarchy';
import Employee              from './pages/System/Employee';
import ProductionOverview    from './pages/Production/Overview'
import ProductionOrder       from './pages/Production/Order'
import ProductionProduction  from './pages/Production/Production'
import { notificationStore } from './modules/stores/notification';
import { authStore, authStoreType } from "./modules/stores/auth"
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const user = authStore(s=>s.user)
  const notify = notificationStore(s=>({notifs:s.notifications}))
  return (
    <div className="App">
		<Menu/>
		<BrowserRouter>
		<Routes >
			<Route path='/' 				element={<Index/>} />
      {user.id?<>
			<Route path='/System/Designer' 	element={<Designer />} /> 
			<Route path='/System/Hierarchy' 	element={<Hierarchy />} /> 
			<Route path='/System/Employee' 	element={<Employee />} /> 
			<Route path='/Production/Overview' 	element={<ProductionOverview />} /> 
			<Route path='/Production/Order/:orderId' 	      element={<ProductionOrder />} /> 
			<Route path='/Production/Production/:productionId' 	element={<ProductionProduction />} /> 
      </>:<></>}
		</Routes>
	  </BrowserRouter>
    <div className="toast toast-end">
      {notify.notifs.map(n=><>
        <div className="alert alert-info">
          <div>
            <span>{n.msg}</span>
          </div>
        </div> 
      </>)}
</div>

    </div>
  )
}

export default App
