/* Application ownership and object hand-offs. Geometry stays separate from step content. */
const DIAGRAM_LANES = [
 ['PLM / Engineering','Product & manufacturing structure','FolderTree','engineering','external'],
 ['VC / AVC','Configuration model & selection','SlidersHorizontal','configuration','config'],
 ['SAP IBP · Demand','Forecast, mix & consumption','ChartNoAxesCombined','ibp-role','ibp'],
 ['SAP IBP · Supply','Network constraints & scenarios','Network','supply','ibp'],
 ['S/4 · Sales (SD)','Customer order & commercial data','FileCheck2','sales','s4'],
 ['S/4 · Demand Mgmt','PIRs & customer requirements','Database','demand-role','s4'],
 ['S/4 · MRP / MM','Material planning & procurement','ListFilter','mrp-role','s4'],
 ['S/4 · PP/DS','Supply simulation & scheduling','CalendarCheck','ppds','s4'],
 ['S/4 · Production (PP)','Release, staging & goods issue','Factory','execution','s4'],
 ['S/4 · QM / Inventory','Inspection, receipt & usable stock','PackageCheck','execution','s4'],
 ['S/4 · aATP','Availability & confirmation','ClipboardCheck','aatp','s4'],
 ['S/4 · Logistics','Delivery, picking & post goods issue','Truck','logistics','s4'],
 ['S/4 · Billing / FI','Invoice, accounting & actuals','FileCheck2','logistics','s4']
];
const DG={width:1730,left:205,pitch:168,nodeW:144,nodeH:74,row:100,top:64};
let diagramZoom=null,diagramScale=1,diagramNodes=[],diagramEdges=[];
function makeDiagram(){
 const steps=getSteps(state),ix=id=>steps.findIndex(s=>s.id===id),mts=state.scenario==='mts',mto=state.scenario==='mto',ibp=usesIbpSupply(state),q=state.qty,h=state.heads;
 const L={engineering:0,config:1,demand:2,supply:3,sales:4,requirements:5,mrp:6,ppds:7,production:8,stock:9,aatp:10,logistics:11,billing:12};
 const nodes=[],edges=[];
 function n(id,step,lane,col,title,detail,extra=''){if(ix(step)<0)return;nodes.push({id,step,index:ix(step),lane,col,title,detail,extra,x:DG.left+col*DG.pitch,y:DG.top+lane*DG.row+12});}
 function e(from,to,label='',kind='solid'){if(nodes.some(n=>n.id===from)&&nodes.some(n=>n.id===to))edges.push({from,to,label,kind});}
 n('foundation','foundation',L.engineering,0,'Product structure','eBOM → mBOM');
 n('source','foundation',L.engineering,2,'Manufacturing source','Version · routing · PDS','Manufacturing master data supports the planning sources and resources in the selected design. VC/AVC alone does not create this planning model.');
 n('model','foundation',L.config,1,state.engine==='VC'?'Classic VC model':'AVC model','KMAT · rules · 150% BOM');
 n('forecast','forecast',L.demand,0,'Baseline forecast',mts?`10 × ${h}-head variant`:'10 printers · mix 6 / 4');
 n('supplyPlan','supplyPlan',L.supply,1,mto?'Shared supply outlook':'Constrained supply','Materials · capacity');
 n('handover','handover',L.supply,2,'Hand over orders',mts?'10 printers · OBP':'6 + 4 modules · OBP');
 n('receivedSupply','handover',L.mrp,2,'Receive planned supply','IBP-owned quantities');
 n('pir','pir',L.requirements,1,mts?'Printer PIR':'Module PIRs',mts?'Strategy 40 · 10 units':'Strategy 70 · 6 + 4');
 n('mrpPre','mrpPre',L.mrp,1,'Advance supply','Planned orders · PRs');
 n('procurePre',ibp?'handover':'mrpPre',L.mrp,ibp?3:2,'Procure parts','PO → receipt → usable','External procurement and remaining component planning stay in the agreed MM/MRP scope. A proposal is not yet usable stock.');
 n('schedulePre','schedulePre',L.ppds,2,'Schedule prebuild',ibp?'Handed-over orders':'PDS · resources · dates');
 n('releasePre','releasePre',L.production,2,'Release & stage','Production orders · GI');
 n('buildPre','buildPre',L.stock,2,mts?'Ready printers':'Ready modules',mts?'10 · anonymous stock':'6 five-head · 4 seven-head');
 n('order','order',L.sales,4,'Sales order request',`${q} printers · ${h} heads`);
 n('selection','order',L.config,4,mts?'Match fixed variant':'Validate & select',mts?`${h}-head execution`:`${state.engine} · selected content`);
 n('demand','demand',L.requirements,4,mts&&!ibp?'Consume printer PIR':'Customer requirement',mts&&!ibp?`${q} order + ${10-q} PIR`:`${q} printers · no parent PIR`);
 n('sync','sync',L.demand,5,'Integrate & consume',`${q} known + ${10-q} forecast`);
 n('sbcCheck','sbcCheck',L.aatp,4,'SBC request','No finished supply ready');
 n('sbcPlan','sbcPlan',L.ppds,5,'Simulate new supply','Components + capacity');
 n('mrp','mrp',L.mrp,mto?6:5,mto?'Supply follow-up':'Explode & net',mto?'Retain accepted proposals':`${q} selected modules`);
 n('procure','mrp',L.mrp,mto?7:6,'Resolve shortages','Buy / make missing parts','Complete the procurement and supply already planned for this requirement. Do not duplicate accepted SBC or IBP proposals.');
 n('schedule','schedule',L.ppds,mto?7:6,mto?'Maintain the plan':'Detailed scheduling','Resource dates');
 n('promise','promise',L.aatp,6,mto?'Confirm SBC result':'Confirm the printer',mto?'Feasible quantity / date':`${q} units · feasible date`);
 n('release','release',L.production,mto?7:6,'Release & stage',!mto&&!ibp?'Module requirement → PIR':'Order-specific production');
 n('build','build',L.stock,7,'Assemble & inspect',`${q} printers · stock E`);
 n('deliver','deliver',L.logistics,8,'Delivery & PGI',`${q} shipped · 0 open`);
 n('feedback','deliver',L.demand,8,'Fulfilment feedback',`${q} fulfilled · ${10-q} open FC`,'Fulfilled quantities remain accounted for in this period example. Integration must also return relevant stock, dates and execution changes to the supply plan.');
 n('invoice','invoice',L.billing,8,'Invoice & close','Billing document · actuals');
 e('foundation','model','Product definition','data');e('foundation','source','Manufacturing model','data');e('model','selection','Valid combinations','data');
 e('source',mto?'sbcPlan':'schedulePre','PDS / resources','data');
 if(ibp){e('forecast','supplyPlan','Demand and expected mix','data');e('supplyPlan','handover','Accepted OBP proposals');e('handover','receivedSupply','Order-based integration');e('receivedSupply','schedulePre','Scheduling ownership');e('receivedSupply','procurePre','Remaining procurement scope');e('sync','supplyPlan','Review supply after order integration','data');}
 else {e('forecast','pir','Agreed forecast','data');e('pir','mrpPre','Requirements');e('mrpPre','procurePre','External parts');e('mrpPre','schedulePre','In-house supply');}
 e('schedulePre','releasePre','Dates & sequence');e('procurePre','releasePre','Usable components');e('releasePre','buildPre','Build · test · GR');
 e('order','selection','Value configuration','data');e('order','demand','Customer requirement');e('order','sync','Order integration','data');
 if(mto){e('order','sbcCheck','Order-entry checking request','data');e('sbcCheck','sbcPlan','Create/check new supply');e('selection','sbcPlan','Selected characteristics','data');e('demand','sbcPlan','New requirement','data');e('sbcPlan','promise','Feasible supply result');e('sbcPlan','mrp','Accepted supply proposals');}
 else {e('selection','mrp','Selected BOM / routing','data');e('demand','mrp','Net requirements');e('order','promise','Confirmation request','data');e('schedule','promise','Dated supply','data');}
 e('mrp','procure','Shortages');e('mrp','schedule','In-house supply');e('schedule','release','Executable plan');e('procure','release','Parts ready');e('release','build','Assembly · test · GR');
 if(mts)e('buildPre','promise','Available printer stock');else if(!mto)e('buildPre','release','Collective module stock');
 e(mts?'buildPre':'build','deliver','Ready printer stock');e('promise','deliver','Confirmed quantity / date','data');e('deliver','invoice','Delivered quantity');e('deliver','feedback','Delivery / GI update','data');e('feedback','sync','Keep fulfilled demand accounted for','feedback');
 return {nodes,edges};
}
function edgeGeometry(edge,nodes){
 const s=nodes.find(n=>n.id===edge.from),t=nodes.find(n=>n.id===edge.to),w=DG.nodeW,h=DG.nodeH;
 let points;
 if(edge.from==='sync'&&edge.to==='supplyPlan'){const y=DG.top+t.lane*DG.row+4;points=[[s.x+w/2,s.y+h],[s.x+w/2,y],[t.x+w/2,y],[t.x+w/2,t.y]];}
 else if(edge.kind==='feedback'){const y=DG.top+2*DG.row+4;points=[[s.x+w/2,s.y],[s.x+w/2,y],[t.x+w/2,y],[t.x+w/2,t.y]];}
 else if(s.col===t.col&&Math.abs(s.lane-t.lane)===1){points=s.lane<t.lane?[[s.x+w/2,s.y+h],[t.x+w/2,t.y]]:[[s.x+w/2,s.y],[t.x+w/2,t.y+h]];}
 else if(s.lane===t.lane&&s.col<t.col){points=[[s.x+w,s.y+h/2],[t.x,t.y+h/2]];}
 else if(s.col<t.col){const channel=t.x-12;points=[[s.x+w,s.y+h/2],[channel,s.y+h/2],[channel,t.y+h/2],[t.x,t.y+h/2]];}
 else {const channel=s.x+w+12;points=[[s.x+w,s.y+h/2],[channel,s.y+h/2],[channel,t.y+h/2],[t.x+w,t.y+h/2]];}
 return{d:points.map((p,i)=>(i?'L':'M')+p.join(',')).join(' '),points};
}
function renderProcessDiagram(){
 const graph=makeDiagram();diagramNodes=graph.nodes;diagramEdges=graph.edges;const height=DG.top+DIAGRAM_LANES.length*DG.row;
 const phases=[['Product & forecast',0,2],['Advance supply',2,2],['Customer demand',4,2],['Plan & execute',6,2],['Delivery & billing',8,1]];
 let svg=`<svg class="flow-connectors" width="${DG.width}" height="${height}" viewBox="0 0 ${DG.width} ${height}" aria-hidden="true"><defs>${['normal','active','done','data'].map((k,i)=>`<marker id="arrow-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${['#acbcd1','#0070f2','#5a9b86','#a79aca'][i]}"/></marker>`).join('')}</defs>`;
 const sorted=[...graph.edges].sort((a,b)=>Number(graph.nodes.find(n=>n.id===a.to).index===state.index)-Number(graph.nodes.find(n=>n.id===b.to).index===state.index));
 svg+=sorted.map(e=>{const s=graph.nodes.find(n=>n.id===e.from),t=graph.nodes.find(n=>n.id===e.to);const active=t.index===state.index||s.index===state.index&&t.index===state.index,done=s.index<state.index&&t.index<state.index;const cls=active?'active':done?'done':e.kind!=='solid'?'data':'normal';return `<path data-from="${e.from}" data-to="${e.to}" class="flow-edge ${cls} ${e.kind!=='solid'?'dashed':''}" d="${edgeGeometry(e,graph.nodes).d}" marker-end="url(#arrow-${cls})"><title>${esc(s.title+' → '+t.title+': '+e.label)}</title></path>${active&&state.playing?`<circle class="flow-packet" r="3.3" fill="#0070f2"><animateMotion dur="2.5s" repeatCount="indefinite" path="${edgeGeometry(e,graph.nodes).d}"/></circle>`:''}`;}).join('')+'</svg>';
 $('#process-diagram').innerHTML=`<div class="diagram-phase-label" style="width:${DG.left-12}px">APPLICATION / COMPONENT</div>${phases.map(([t,c,span],i)=>`<div class="diagram-phase" style="left:${DG.left+c*DG.pitch-10}px;width:${span*DG.pitch}px"><span>0${i+1}</span>${t}</div>`).join('')}${DIAGRAM_LANES.map((l,i)=>`<div class="swimlane ${l[4]}" style="top:${DG.top+i*DG.row}px;height:${DG.row}px;width:${DG.width}px"><button class="lane-label" data-explain="${l[3]}" style="width:${DG.left-16}px">${icon(l[2])}<span><b>${l[0].replace('VC / AVC',state.engine==='VC'?'Classic VC':'AVC')}</b><small>${l[1]}</small></span><span class="lane-info">ⓘ</span></button></div>`).join('')}${svg}${graph.nodes.map(n=>{const active=n.index===state.index,done=n.index<state.index;return `<button data-node="${n.id}" data-step="${n.index}" class="flow-node ${active?'active':done?'done':'upcoming'} ${n.id==='buildPre'||n.id==='build'?'stock-node':''}" style="left:${n.x}px;top:${n.y}px;width:${DG.nodeW}px;height:${DG.nodeH}px" ${active?'aria-current="step"':''} aria-label="Step ${n.index+1}: ${esc(n.title)}. ${esc(n.detail)}. Open explanation."><span class="node-step">${done?'✓':String(n.index+1).padStart(2,'0')}</span><b>${n.title}</b><small>${n.detail}</small><span class="node-open">↗</span></button>`}).join('')}${state.scenario==='mto'?`<div class="no-prebuild" style="left:${DG.left+168}px;top:${DG.top+8*DG.row}px"><b>No advance stock in this MTO example</b><span>IBP can review shared supply and buffers. Here, SBC + PP/DS plans the printer at order entry; physical production follows confirmation.</span></div>`:''}`;
 $('#process-diagram').style.width=DG.width+'px';$('#process-diagram').style.height=height+'px';sizeDiagram();
}
function sizeDiagram(){const viewport=$('#diagram-viewport');if(!viewport||!viewport.clientWidth)return;diagramScale=diagramZoom??Math.max(.72,Math.min(1,viewport.clientWidth/DG.width));$('#process-diagram').style.transform=`scale(${diagramScale})`;$('#diagram-sizer').style.width=DG.width*diagramScale+'px';$('#diagram-sizer').style.height=(DG.top+DIAGRAM_LANES.length*DG.row)*diagramScale+'px';$('#zoom-fit').textContent=`${Math.round(diagramScale*100)}% · Fit`;}
function changeDiagramZoom(amount){diagramZoom=Math.min(1.6,Math.max(.6,diagramScale+amount));sizeDiagram();focusActiveNode(true);}
function focusActiveNode(force=false){
 if(!$('#follow-step').checked||!state.playing&&!force)return;
 requestAnimationFrame(()=>{const node=$('.flow-node.active'),v=$('#diagram-viewport');if(!node)return;const r=node.getBoundingClientRect(),b=v.getBoundingClientRect();const behavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
 if(v.scrollHeight>v.clientHeight+2){if(r.right>b.right-10||r.left<b.left+10||r.bottom>b.bottom-10||r.top<b.top+10)v.scrollTo({left:v.scrollLeft+r.left-b.left-v.clientWidth*.55,top:v.scrollTop+r.top-b.top-v.clientHeight*.45,behavior});}
 else {if(r.right>b.right-10||r.left<b.left+10)v.scrollTo({left:v.scrollLeft+r.left-b.left-v.clientWidth*.55,behavior});const top=$('.topbar').getBoundingClientRect().height+$('.player').getBoundingClientRect().height+20;if(r.top<top||r.bottom>innerHeight-50)window.scrollTo({top:scrollY+r.top-top-100,behavior});}
 });
}

function showStepDetails(nodeId){
 const s=getSteps(state)[state.index],node=diagramNodes.find(n=>n.id===nodeId),relevant=diagramEdges.filter(e=>{const n=diagramNodes.find(n=>n.id===e.to);return node?e.to===node.id:n.index===state.index;});
 const handoffs=relevant.map(e=>{const source=diagramNodes.find(n=>n.id===e.from);return `<li><b>${DIAGRAM_LANES[source.lane][0]}</b> → ${esc(e.label)}</li>`;}).join('');
 const body=`${node?.extra?`<p class="callout">${node.extra}</p>`:''}<p>${s.summary}</p><ul class="tasks">${s.tasks.map(t=>`<li>${t}</li>`).join('')}</ul><div class="object-line"><span>OUTPUT</span><b>${s.output}</b></div>${handoffs?`<h3>Connections into this step</h3><ul class="connection-list">${handoffs}</ul>`:''}<div class="step-actions"><button class="text-link" data-explain="${s.explain}">${icon('BookOpen')} Explain the concept</button></div><p class="small muted" style="margin-top:24px">${s.next}</p>`;
 openDialog(node?.title||s.title,body,EXPLANATIONS[s.explain]?.sources||[],`STEP ${state.index+1} · ${node?DIAGRAM_LANES[node.lane][0]:s.owner}`);
}
function renderDemandDiagram(d){
 const available=lab.mode!=='none',waiting=lab.event==='arrived';
 return `<div class="demand-flowchart" aria-label="Sales-order input and two separate consumption calculations">
 <div class="demand-swimlane"><b class="demand-lane-title">S/4HANA<small>Fixed variant · strategy 40</small></b><div class="demand-flow-node"><span>SALES REQUIREMENT</span><strong>${d.actual} printers</strong><small>${lab.event==='cancelled'?'Order cancelled':d.actual?'Known in S/4':'No customer order'}</small></div><i class="demand-arrow">→</i><div class="demand-flow-node"><span>PIR CONSUMPTION</span><strong>${d.s4.consumed} consumed</strong><small>Initial PIR: ${lab.forecast}</small></div><i class="demand-arrow">→</i><button class="demand-flow-node result" data-explain="consumption"><span>OPERATIONAL DEMAND</span><strong>${d.actual} + ${d.s4.open} = ${d.s4.total}</strong><small>Order + residual PIR ↗</small></button></div>
 <div class="integration-bridge ${waiting?'waiting':''}"><span>↓</span> ${!available?'No order interface in this design':waiting?'Order integration pending':d.integrated?'Order input integrated · calculation run':'Order interface & calculation when applicable'} <button class="text-link" data-explain="ibp">Explain ↗</button></div>
 <div class="demand-swimlane ibp"><b class="demand-lane-title">SAP IBP<small>${lab.mode==='obp'?'Order-based example':lab.mode==='ts'?'Time-series example':'Forecast-only example'}</small></b><div class="demand-flow-node"><span>KNOWN ORDER INPUT</span><strong>${d.known} printers</strong><small>${waiting?'IBP still has no order':available?'At matching planning level':'Input not configured'}</small></div><i class="demand-arrow">→</i><div class="demand-flow-node"><span>${available?'FORECAST CONSUMPTION':'BASELINE FORECAST'}</span><strong>${available?d.consumed+' consumed':lab.forecast+' expected'}</strong><small>Baseline stays ${lab.forecast}</small></div><i class="demand-arrow">→</i><button class="demand-flow-node result" data-explain="ibp"><span>${available?'DEMAND FOR PLANNING':'FORECAST-ONLY VIEW'}</span><strong>${available?`${d.known} + ${d.open} = ${d.total}`:'No total calculated'}</strong><small>${available?'Order + open forecast':'Order-aware total unavailable'} ↗</small></button></div></div>`;
}
