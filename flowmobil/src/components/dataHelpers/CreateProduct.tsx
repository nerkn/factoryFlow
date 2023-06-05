import { MouseEventHandler } from 'react'
import {formSubmit} from '../../libs/utils'

export default function CreateProduct(
  {success, cancel}:
  {success:(...data:any[])=>void, cancel:MouseEventHandler}){
  let submit = formSubmit(success)
return <div className="modal CreateProductModal">
    <div className="modal-box">
<h3>Create Product</h3>
<form onSubmit={submit} action='/api/v1/products' >
  <div className="form-control w-full ">
  <label className="label">    <span className="label-text">Product Name</span>  </label>
  <input type="text" name="title" className="input input-bordered w-full " />
</div>

<div className="form-control w-full ">
  <label className="label">    <span className="label-text">Type</span>  </label>
  <select name="type"  className="input input-bordered w-full " >
    <option>semi product</option>
    <option>raw material</option>
    <option>product</option>
  </select>
</div>
<div className="form-control w-full "> 
  <label className="label">    <span className="label-text">&nbsp;</span>  </label>
</div>
<div className="flex w-full "> 
  <input type="submit"  className="input input-bordered w-1/2 " value='Save' />
  <input type="button"  className="input input-bordered w-1/2 " value='Cancel'  onClick={cancel}/>
</div>

</form>
</div>
</div>
}