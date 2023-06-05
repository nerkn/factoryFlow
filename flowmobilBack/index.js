let {app} = require('./config');
let loggedUsers = []

app.get('/', (q,s)=>{
  s.json({msg:'not found', error:1 })
  })
app.use((q,s,n)=>{console.log('accessing', q.path,q.params);n();})
          
app.post('/api/signin', async (q,s)=>{
  console.log(q.body);
  let token = Math.round(1e9+Math.random()*
              10000*
              (new Date().getTime())).toString(23)
  s.cookie('token',token);
  userData = await q.db.query("select id,username from User where email=? and pass=?", 
  [q.body.email, q.body.password]);
  if(userData.length){
    loggedUsers[token] = userData[0];
    s.json({error:0, data:userData[0]  })
  }else{
    s.json({error:1, msg:'User not found'  })
  }
  })
  app.use((q,s,n)=>{
    console.log('loggedUsers', loggedUsers)
    q.user = loggedUsers[q.cookies.token]??false;
    n();})

  /* type=semi product, title asc 
     price>15, product desc

  */
  function getOrderBy(params){
    if(params.replaceAll(/(\w|=|,|<|>|\ |%)*/g, '')){
      console.log("error in orderby", params)
      return false;
    }
    params = params.split(',')
    if(!params.length)
      return false;
    let orderbys = [];
    for(p of params){
      let sepop = p.search(/(=|<|>|%)/g)
      if(sepop<0){
        orderbys.push(p)
        continue;
      }
      let part1 = p.substring(0, sepop)
      let part2 = p[sepop];
      let part3 = p.substring(sepop+1)
      switch(p[sepop]){
        case '%':
          part2 = ' like ';
          part3 = `"%${[part3]}%"`;
          break;
        default: 
          part3 = `"${[part3]}"`;
      }
      orderbys.push(part1+part2+part3)
    }
    if(!orderbys.length)
      return false;
    return 'order by '+orderbys.join(', ')
  }
  function getWhere(params){
    if(params.replaceAll(/(\w|,|\ )*/g, '')){
      console.log("error in where", params)
      return false;
    }
    let [field, op, ...values] = params.split(',')
    let ops = "in,eq,lt,gt,like".split(',')
    if(!values.length)          return false
    if(!values[0])              return false
    if(!ops.includes(op))       return false;
    let value = values[0];
    switch(op){
      case 'eq':           op = '='; break;
      case 'lt':           op = '<'; break;
      case 'gt':           op = '>'; break;
      case  'like':        value = `%${values[0]}%`;
                           break;
      case 'in':           value = values;
                           break;
      default:             value = values[0]
    }
    return [field, op, value]
  }
app.get('/api/v1/:table', async (q, s)=>{
  let table       = 'fm_'+q.params.table
  let where       = ''
  let orderby     = ''
  let paramExtra  = []
  if(!q.tablesInDB.includes(table)){
	console.log('q.tablesInDB', q.tablesInDB);
    return s.json({msg:'table not found', error:1})

  }
  if(q.query){
    if(q.query.where){
      let w1 = getWhere(q.query.where);
      if(w1){
        paramExtra.push( w1[2])
        where = `where ${w1[0]} ${w1[1]} (?)`
      }
    }
    if(q.query.orderby)
      orderby = getOrderBy(q.query.orderby);
  }
  console.log(q.query.where, `select * from  ${table} ${where}`, paramExtra);
  q.db.query(`select * from  ${table} ${where} ${orderby}`, paramExtra)  
    .then(data=>s.json({msg:'super',     error:0, data:data}))  
    .catch(e=>s.json({msg:'not found', error:1, data:e}))  
  
})
app.post('/api/v1/:table', async (q, s)=>{
  let table       = 'fm_'+q.params.table
  if(!q.tablesInDB.includes(table)){
	console.log('q.tablesInDB', q.tablesInDB);
    return s.json({msg:'table not found', error:1})
  }
  let keys   = []
  let values = []
  console.log('post to ',table, q.body)
  if(q.body){
    for(i in q.body){
      keys.push(`${i}=?`)
      values.push(q.body[i])
    }
  }
  if(!keys.length)
    return s.json({msg:'notting send to save', error:1})
  let response= []

  if(keys.includes(`user=?`)){
    if(!q.user )
      return s.json({msg:'user not found', error:1})
    let location = keys.indexOf(`user=?`)
    values[location] = q.user.id;
  }

  if(keys.includes(`UpdatedAd=?`)){ 
    let location = keys.indexOf(`UpdatedAd=?`)
    values[location] = new Date();
  }
  if(keys.includes(`id=?`)&&q.body['id']){
    values.push(q.body['id']);
    let qe= ''
    response.push( await  q.db.query(qe=`update  ${table} set  ${keys} where id=?`, values)  );
    console.log('update', table, qe, values, q.body)
  }else{
    response.push( await  q.db.query(`insert into  ${table} set  ${keys}`, values)  );
    console.log('insert', table)
  }
  

  s.json({data: response, error:0})
})
app.post('/api/v1/multi/:table', async (q, s)=>{
  let table       = 'fm_'+q.params.table
  if(!q.tablesInDB.includes(table)){
	console.log('q.tablesInDB', q.tablesInDB);
    return s.json({msg:'table not found', error:1})
  }
  console.log(q.body)
  let response= []
  if(q.body){
    for(body of q.body){
      let keys   = []
      let values = []
      for(i in body){
        keys.push(`${i}=?`)
        values.push(body[i])
      }
      if(!keys.length){
        response.push({msg:'notting send to save', error:1})
        continue;
      }
      if(keys.includes(`id=?`)&&body['id']){
        values.push(body['id']);
        response.push( await  q.db.query(`update  ${table} set  ${keys} where id=?`, values)  );
        console.log('update')
      }else{
        response.push( await  q.db.query(`insert into  ${table} set  ${keys}`, values)  );
        console.log('insert')
      }
    }
  }
  s.json({data: response, error:0})
})


app.get('/api/v1/:table/:id', async (q, s)=>{
  console.log(q.params);
  console.log(q.body);
  let table = 'fm_'+q.params.table
  if(!q.tablesInDB.includes(table))
    return s.json({msg:'table not found', error:1})
  q.db.query(`select * from  ${table}  where id=? `, [q.params.id])  
    .then(data=>s.json({msg:'super',     error:0, data:data.length?data[0]:[]}))  
    .catch(e=>s.json({msg:'not found', error:1, data:e}))  
  
})

app.listen(3000)
