let {app, dbRequests} = require('./config');
app.get('/', async (q,s)=>{
  let d = await q.findOne('Users', '{"email":"erkintek@gmail.com"}');
  s.json({msg:'not found', error:d} )
  })

app.post('/auth/signin', async (q,s)=>{
  console.log(q.body);
  let data = await pool.query("select * from User where email=? and pass=?", 
    [q.body.email, q.body.password])
  s.json({msg:'not found', error:1, data:data  })
  })


app.get('/api/v1/:table', async (q, s)=>{
  let table       = 'fm_'+q.params.table
  let where       = ''
  let paramExtra  = []
  if(!q.tablesInDB.includes(table))
    return s.json({msg:'table not found', error:1})
  if(q.query){
    if(q.query.where){
    let w1 = q.query.where.replaceAll(/[)(]/g, '').split(',')
    paramExtra.push( w1[2])
    where = `where ${w1[0]} = ?`
    }
  }
  console.log(q.query.where, `select * from  ${table} ${where}`, paramExtra);
  q.db.query(`select * from  ${table} ${where}`, paramExtra)  
    .then(data=>s.json({msg:'super',     error:0, data:data}))  
    .catch(e=>s.json({msg:'not found', error:1, data:e}))  
  
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
