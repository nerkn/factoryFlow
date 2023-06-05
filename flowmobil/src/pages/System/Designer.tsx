import * as meTypes from './Designer.types';
import React, { useCallback, useEffect, useState, memo, ChangeEvent } from 'react';
import axios from 'axios';
import ReactFlow, {
  addEdge,  Handle, Position,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState, 
  ReactFlowInstance,
  useUpdateNodeInternals,
  ReactFlowProvider,
  Connection,
  Edge, Node
} from 'reactflow';

import CreateProduct from '../../components/dataHelpers/CreateProduct';
import 'reactflow/dist/style.css';
import '../../assets/DesignerFlow.css';
import { notificationStore } from '../../modules/stores/notification';
import ProcessDialog from '../../components/dataHelpers/ProcessDialog';
import { QuantityUnit, ServerResponse } from '../../libs/types';


const initialIds:number  = new Date().getTime();
const initialNodes:Node<meTypes.NodeData> [] = [
	{ id: ''+initialIds,   type:'ProcessNode', data: { Title: 'New Node', outputs:[], inputs:[] }, position: { x: 100, y: 100 },  width:70, height:40  },
	{ id: ''+initialIds+1, type:'ProcessNode', data: { Title: 'Node 2'  , outputs:[], inputs:[] }, position: { x: 200, y: 100 },  width:50, height:40 },
  
  ];
const initialEdges = [{ id: 'e1-2', source: ''+initialIds, target: ''+initialIds+1 }];
const dummyEdge:meTypes.Edge = {id:'', data:{product:0, quantity:0, unit:'unit' }, label:'', source:'', sourceHandle:'',target:'', targetHandle:''}
const QuantityUnits = QuantityUnit;
//const nodeTypes = {   custom: CustomNode, };

const minimapStyle = {
  height: 120,
};

const ProcessTypeInitial:meTypes.processType = {id:0, Title:" - ", CreatedAt:new Date(), UpdatedAt:new Date(), Elements:[],productsInput:'', productsOutput:''}

function createHandleId(id:number|string, handleid:number|string, type:string='out' ):string{
  return type+''+id+'-'+handleid
}


const onInit = (reactFlowInstance:ReactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

function NodeSelectedProperties({nodeSelectedU,        nodesSet,        edges,                         products, 
                                 nodeSelectedSet,     nodes}:
                                {nodeSelectedU: Node|undefined, nodesSet:Function, edges:Edge[], products:meTypes.ProductDb[],
                                nodeSelectedSet:Function, nodes:Node[]  }){
  let updateinternals = useUpdateNodeInternals();
	if(!nodeSelectedU)
		return <h2>No Selected nodes</h2>
  let nodeSelected = nodeSelectedU;
    console.log('Nodeselected:', nodeSelected.data.outputs.length)
	//let ns = nodeSelected
	let onchange = (e:ChangeEvent<HTMLInputElement>)=>{
		let newdata:Node 	  = {...nodeSelected, data:{...nodeSelected.data, Title:e.target.value }}
		let nodesNew:Node[]	= nodes.map(e=>e.id==newdata.id?newdata:e);
		nodesSet( nodesNew )
		nodeSelected = newdata
		nodeSelectedSet(nodeSelected); 
		}
  let onAddOutput = (e:ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>{
    let newOutput:meTypes.Edge = {
                  id:''+(new Date().getTime()),
                  data:{product : e.target.value, quantity:1, unit:'cm'},
                  source:nodeSelected.id,
                  sourceHandle:'out'+nodeSelected.id+'-'+nodeSelected.data.outputs.length,
                  label:'', target:''
                }
		let newdata:Node 	= {...nodeSelected, data:{...nodeSelected.data, outputs:[...nodeSelected.data.outputs, newOutput ]}}
		let nodesNew	= nodes.map(e=>e.id==newdata.id?newdata:e);
    
		nodesSet( nodesNew ) 
		nodeSelectedSet(newdata);  
    e.target.value = '';
    updateinternals(nodeSelected.id);
    }
    function getParentProductStuff(parent:HTMLElement|null){
      if(!parent)
        return ;
      let product :HTMLInputElement|null = parent.querySelector('[name="product"]')
      if(!product)
        return ;
      let quantity:HTMLInputElement|null =parent.querySelector('[name="quantity"]')
      if(!quantity)
        return ;
      let unit    :HTMLInputElement|null = parent.querySelector('[name="unit"]')
      if(!unit)
        return ;
      return {id:parseInt(product.dataset.id || ''), 
              pid: product.value, 
              q:parseInt(quantity.value), 
              u:unit.value  as  meTypes.QuantityUnit}
    }
  let onChangeOutput = (n:ChangeEvent<HTMLSelectElement|HTMLInputElement>)=>{
    let pPVals = getParentProductStuff(n.target.parentElement)
    if(!pPVals)
      return;
    nodeSelected.data.outputs[pPVals.id] = {
      ...nodeSelected.data.outputs[pPVals.id],
      data:{product : pPVals.pid, 
            quantity: pPVals.q,
            unit: pPVals.u}      
      } 
		let newdata 	= {...nodeSelected, data:{...nodeSelected.data, outputs:[...nodeSelected.data.outputs]}}
		nodeSelectedSet(()=>newdata); 
		nodesSet((nodes:meTypes.Node[] )=> nodes.map(e=>e.id==newdata.id?newdata:e) )
  }
  
	return <>
		<form className='flex flex-col' data-id={nodeSelected.id}>
			<label className='flex'>
        <span className='w-full'>{nodeSelected.id}</span>
        <a className='btn btn-xs btn-outline btn-secondary' onClick={()=>nodesSet((n:meTypes.Node[] )=>n.filter(n=>n.id!=nodeSelected.id))} title='Kill this node?' >X</a>
      </label>
			<label><input 
        className="input input-bordered input-sm w-full max-w-xs" 
        value={nodeSelected.data.Title} onChange={onchange} key={'df'+nodeSelected.id} /></label>
			<b>Outputs</b>
      {nodeSelected.data.outputs.map((output:meTypes.NodeInOut, i:number)=>
        <label className='w-full flex'  key={nodeSelected.id+'-'+i}>
          <select name="product" className='select select-bordered max-w-xs select-sm' defaultValue={output.data?.product} onChange={onChangeOutput} data-id={i}>{products.map(e=><option value={e.id} >{e.title}</option>)}</select>
          <input  style={{width:'33%'}} name='quantity' defaultValue={output.data?.quantity} onChange={onChangeOutput} />
          <select className='bg-white'  name='unit' defaultValue={output.data?.unit} onChange={onChangeOutput} >{QuantityUnits.map(u=><option>{u}</option>)}</select>
        </label>
      )}
      <label><select  className='select select-bordered w-full max-w-xs select-sm' onChange={onAddOutput}><option></option>{products.map(e=><option value={e.id} >{e.title}</option>)}</select></label>
			
			<b>Inputs</b>
      {nodeSelected.data.inputs.map((input:meTypes.NodeInOut, i:number)=>
      products.filter(e=>e.id==input.data?.product).map(p=>p.title)
      )}
        
		</form>
	</>

}
function ProcessNode ({data, isConnectable, id  }:{data:meTypes.NodeData, isConnectable:boolean, id:meTypes.NodeId })  {
	let inputCount = data.inputs?.length||0 ;
	inputCount++;
	let outputCount = data.outputs?.length ||1;
	//outputCount++; 
	let inputs =[]
		for(let i=0;i<inputCount;i++)
			inputs.push(<Handle
				type="target"
				position={Position.Left}
				style={{top:10+i*10, background: '#F55' }}
				onConnect={(params) => console.log('handle onConnect', params)} 
        isConnectable={isConnectable}
        id={'in'+id+'-'+i}
			  />)

	let outputs =[]
	for(let i=0;i<outputCount;i++)
		outputs.push(<Handle
			type="source"
			position={Position.Right}
			style={{ top:10+i*10, background: '#55F' }}
			//onConnect={(params) => console.log('handle onConnect', params)} 
			isConnectable={isConnectable}
			id={'out'+id+'-'+i}
		  />)
      console.log('data outs', data.outputs)
	return (
	  <div className='border border-indigo-600 bg-orange-50	 rounded-md' key={'Node'+id}>
	  	{inputs}
		  <div className='px-2'>
        {data.Title} 
        <div className='text-sm	'>
          
          </div>  
      </div>
		  {outputs} 
	  </div>
	);
  }
  const nodeTypes = { ProcessNode: ProcessNode };

const Designer = () => {
	const [processes, processesSet] = useState([] as meTypes.processType[])
	const [products,  productsSet]  = useState([])
	const [processSelected, processSelectedSet] = useState(ProcessTypeInitial)
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [nodeSelected, nodeSelectedSet]  		= useState<Node>()
	const [edgeSelected, edgeSelectedSet]  		= useState<Edge>()
  const [ProcessDialogOpener, ProcessDialogOpenerSet] = useState(false);

  const notify = notificationStore(s=>({add:s.add}))
  
  useEffect(()=>console.log('useff ', nodeSelected), [nodes, nodeSelected])
	const onConnect = useCallback((params:Connection) 		=> {
    if(!params.source) 
      return;
    if( !params.target)
      return;
    let source = params.source
    let sourceNode = nodes.find(e=>e.id==params.source)
    let targetNode = nodes.find(e=>e.id==params.target)
    if(!sourceNode || !targetNode)
      return console.log('source or target node not found',  nodes, params)
    let sourceOutHandleId = parseInt(params.sourceHandle?.split('-').pop()||'') || 0
    let targetInHandleId  = parseInt(params.targetHandle?.split('-').pop()||'') || 0
    let sourceOutHandle = sourceNode.data.outputs[sourceOutHandleId]
    let targetInHandle  = targetNode.data.inputs[targetInHandleId]
    if(!sourceOutHandle || targetInHandle){
      console.log('Source not found or target handle exists:',sourceOutHandle , targetInHandle)
      console.log('params sourceHandle', sourceNode.data.outputs, targetNode.data.inputs);
      console.log('params',sourceNode, targetNode)
                          return ;
    }
    let newEdge: meTypes.NodeInOut = {
      id:'', 
      process:processSelected.id,
      product:'', quantity:0, unit:'unit' as meTypes.QuantityUnit,
      sourceHn:'',  
      ...params,
      source:source||'', 
      data:sourceOutHandle.data }
    

    setNodes(nodes=>nodes.map(n=>{
      if(n.id!=targetNode?.id)
        return n; 
      return {...targetNode, data:{
                             ...targetNode.data, 
                            inputs:[...targetNode.data.inputs, newEdge]
                            },
          id:n.id
      }}))  
      let newEdgeNewData = newEdge.data??{product:0, quantity:0, unit:'unit'}
      let newEdge2: meTypes.Edge = {
        label:'',
        data:newEdgeNewData,
        ...newEdge, ...params,         
        sourceHandle:params.sourceHandle||'',
        targetHandle:params.targetHandle||'',
         source:source, target:params.target
        
      }
    setEdges((eds) => addEdge( newEdge2, eds));
    console.log('new edge added', newEdge, sourceOutHandle)
  },  [setEdges, nodes]);
	const productsUpdate = ()=>axios('/api/v1/products?orderby=type' ).then(r=>productsSet(r.data.data))
	const onSelectionChange  = useCallback((d:{nodes:Node[], edges:Edge[]})=>{
     nodeSelectedSet(d.nodes[d.nodes.length-1] )
     edgeSelectedSet(d.edges[d.edges.length-1])
    }, [] ) ;
	useEffect(()=>{		axios('/api/v1/process'  ).then(r=>processesSet(r.data.data as meTypes.processType[])) 	}, [])
	useEffect(()=>{   productsUpdate()} 	, [])
  function edges2nodeIO(edges:meTypes.Edge[]):meTypes.NodeInOut[]{
    return edges.map(e=>({ 
                          process:processSelected.id,
                          product:0,
                          quantity:0, 
                          unit:'unit',
                          sourceHn:e.sourceHandle,
                          ...e}))
  }
	useEffect(() => {		//Get details of selected process 
		if(!processSelected.id)
			return;
		Promise.allSettled([
			axios(`/api/v1/processNode?where=process,eq,${processSelected.id}` ),
			axios(`/api/v1/processEdge?where=process,eq,${processSelected.id}` )
		]).then(datas=>{
      if(datas[0].status == 'rejected' || datas[1].status == 'rejected' )
      return notify.add('error loading');
      let loadedEdges = datas[1].value.data.data as meTypes.EdgeDb[];
      let loadedNodes = datas[0].value.data.data as meTypes.NodeDb[];
			let newEdges:meTypes.Edge[] = loadedEdges.map((e,i)=>({
                                      id:'edge'+e.id,  label:'',//no title', 
                                      data:{product:e.product, quantity:e.quantity, unit:e.unit},
                                      source:''+e.source, target:''+e.target, 
                                      sourceHandle:e.sourceHn, targetHandle:e.targetHn }))
      let nodesSource = loadedEdges.map(l=>l.source)                    

      let newNodes:meTypes.Node[] = loadedNodes.sort((a,b)=>a.sort-b.sort).map((e,i)=>{
        let adata = e.additionalData?JSON.parse(e.additionalData):'';

        return {id:''+e.id, type:'ProcessNode',  
                  data: {
                    Title:e.title?e.title:'no name',
                    inputs: edges2nodeIO(newEdges.filter(le=>le.target==e.id)) , 
                    outputs:edges2nodeIO(newEdges.filter(le=>le.source==e.id)),  
                  },
                position:{x:adata?.Position?.x||70*i , y:adata?.Position?.y||100+10*i}, height:40, width:60 ,
                }
         })
               
      let endNode = loadedEdges.map(l=>l.target).find(ns=>!nodesSource.includes(ns))
      if(endNode){
        let nodeLast =  newNodes.find(nns=>nns.id==endNode)
        if(nodeLast){
          let outputsToPush= nodeLast?.data?.outputs
          if(outputsToPush){
            processSelected.productsOutput.split(',').forEach(p=>outputsToPush.push({id:'outputter'+p, 
            label:'', sourceHandle:'', target:'',
              data:{product:p, quantity:1, unit:'unit'}, 
              source:nodeLast?.id||''}))
          }
      }
      }
			console.log('nodes', newNodes, 'edges',  newEdges)
			setNodes(newNodes)
			setEdges(newEdges)
		} )
	  
	}, [processSelected]) 
  function ActionSave(){
    let nodesDb:meTypes.NodeDb[] = nodes.sort((a,b)=>a.position.x-b.position.x).
      map((n,i)=>({
                    id:n.id, 
                    process:processSelected.id,
                    title:n.data.Title, 
                    additionalData:JSON.stringify({
                        Position:n.position, 
                        height:n.height, 
                        width:n.width}), 
                    sort:i }))
    axios.post(`/api/v1/multi/processNode`, nodesDb).then(r=>console.log(r));
    let nodesSource:number[] = []
    let nodesTarget:number[] = []
    let edgesDb:meTypes.EdgeDb[] = edges.map(e=>{
       let sourceNode = nodes.find(n=>n.id==e.source)
       let targetNode = nodes.find(n=>n.id==e.target)
       let sourceHandle = sourceNode?.data.outputs.find(o=>(('sourceHandle' in o)&&(o.sourceHandle==e.sourceHandle)))
       nodesSource.push(parseInt(e.source))
       nodesTarget.push(parseInt(e.target))
       console.log('saving edge', e, sourceNode, sourceHandle)
       let id:number = e.id.startsWith('edge')?parseInt(e.id.substring(4)):0 
     return ({
       id: id,         
       process:processSelected.id,
       source   :e.source, 
       target   :e.target, 
       sourceHn :e.sourceHandle??'', targetHn:e.targetHandle??'',
       product  :+(sourceHandle?.data?.product||0),
       quantity :sourceHandle?.data?.quantity||0,
       unit     :sourceHandle?.data?.unit || "unit" }); 
     })

     let nodeStartT   = nodesSource.filter(ns=>!nodesTarget.includes(ns)).find(e=>true)
     let nodeEndT     = nodesTarget.filter(ns=>!nodesSource.includes(ns)).find(e=>true)
     if(!nodeStartT)
      return notify.add("Cant find starting node! <br>Add node without inputs")
     if(!nodeEndT)
      return notify.add("Ending node cant find! <br>Add node without outputs")
    let nodeEnd = nodeEndT;
    let productsStart  = edgesDb.map(e=>('source' in e)&&(+e.source==nodeStartT)?e.product:undefined).filter(e=>e)
    let productsEnd  = nodes.find(e=>e&&(+e?.id==nodeEnd))?.data?.outputs?.map(output=>output?.data?.product)

     console.log('edges to save ', productsStart, productsEnd)
     axios.post('/api/v1/multi/processEdge',edgesDb).then(r=>notify.add('Edges Saved'))
     axios.post('/api/v1/process',{
        id:processSelected.id, 
        nodeCount:nodesDb.length,  
        productsInput:productsStart.join(), 
        productsOutput:productsEnd?.join() })
   }
  return (
	<div className='grid' style={{gridTemplateColumns:"20em 1fr"}} >
    <ReactFlowProvider>
		<div className=''  >
		<div className='flex flex-wrap'  >
		{processes.map(p=><a className='btn badge badge-accent badge-outline grow' key={p.id} onClick={()=>processSelectedSet(p)} >{p.Title}</a> )}
    </div>
		<h2>{processSelected?.Title}</h2>
		<ul className="menu bg-base-100 w-56">			 	</ul>
		<div className='bg-amber-100 min-h-[10em]' >
			<NodeSelectedProperties 
				nodeSelectedU={nodeSelected}
				nodeSelectedSet={nodeSelectedSet}
				nodes={nodes} 
				edges={edges} 
				nodesSet={setNodes} 
				products={products} />
        {edgeSelected?<a onClick={()=>{
          let targetNode = nodes.find(n=>n.id == edgeSelected.target)
          if(!targetNode)
            return;
          let inputsNew = targetNode?.data.inputs.filter(n=>n.source!=edgeSelected.source)
          targetNode.data.inputs = [...inputsNew];
          setEdges([...edges.filter(e=>e.id!=edgeSelected.id)]); 
          edgeSelectedSet(undefined);
          }} className="btn" >Remove </a>:''}
		</div>
		<div>
      <h3>Add/New</h3>
      <a className='btn btn-outline btn-sm btn-info' onClick={()=>ProcessDialogOpenerSet(s=>!s)}>Process</a>
				<a className="btn btn-sm btn-outline btn-info w-full" onClick={()=>document.querySelector(".CreateProductModal")?.classList.add('modal-open')} >Product</a>
				<a className="btn btn-sm btn-outline btn-info w-full" onClick={()=>{
          axios.post('/api/v1/processNode', {additionalData:'', process:processSelected.id, sort:99}).then(r=>console.log(r,r.data, setNodes([...nodes,{ id: ''+r.data.data.insertId,     type:'ProcessNode', data: { Title: 'New Node', outputs:[], inputs:[] }, position: { x: 100, y: 100 },  width:70, height:40  }  ]))) }} >Node</a>
        <a className='btn btn-sm btn-outline btn-info w-full' 
          onClick={ActionSave}>Save</a>
        <a className='btn btn-sm btn-outline btn-info w-full' 
          onClick={()=>notify.add('hello')}>Notify</a>
          
        <div className='max-h-20	overflow-y-auto	'>
			{edges.map(e=><div className="border">{e.id} {e.label} {e.source} {e.target}</div>)}
      </div>
		</div>
		</div>
		<div>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
	    onSelectionChange={onSelectionChange}
      onConnect={onConnect}
      onInit={onInit}
      nodeTypes={nodeTypes}
      fitView={true}
      attributionPosition="top-right"
      
    >
      <MiniMap style={minimapStyle} zoomable pannable />
      <Controls />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
	</div>
  </ReactFlowProvider>
  <CreateProduct 
    success={()=>{productsUpdate(); document.querySelector(".CreateProductModal")?.classList.remove('modal-open') }}
    cancel ={()=>{ document.querySelector(".CreateProductModal")?.classList.remove('modal-open') }} />

    <ProcessDialog 
      opened={ProcessDialogOpener} 
      closer={ProcessDialogOpenerSet}
      selCB={processSelectedSet}  />
	</div>
  );
};






  
  export default Designer