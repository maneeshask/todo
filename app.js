const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log('DB ERROR ${e.message}')
    process.exit(1)
  }
}
initializeDBAndServer()

const hasPriorityAndStatus = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriority = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatus = requestQuery => {
  return requestQuery.status !== undefined
}

const havePriority = requestBody => {
  if (requestBody.priority !== undefined) {
    return true
  }
}

const haveStatus = requestBody => {
  if (requestBody.status !== undefined) {
    return true
  }
}

const haveTodo = requestBody => {
  if (requestBody.todo !== undefined) {
    return true
  }
}

//api1
app.get('/todos/', async (request, response) => {
  let data = null
  const {search_q = '', priority, status} = request.query
  let getTodoQuery = ''

  switch (true) {
    case hasPriorityAndStatus(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'  AND priority='${priority}' AND status='${status}';`
      break
    case hasPriority(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'  AND priority='${priority}';`
      break

    case hasStatus(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'  AND status='${status}';`
      break
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodoQuery)
  response.send(data)
})

//api2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoBasedOnId = `SELECT * FROM todo WHERE id=${todoId};`
  const result = await db.get(getTodoBasedOnId)
  response.send(result)
})

//api3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postBookQuery = `INSERT INTO todo (id,todo,priority,status)
                      VALUES(${id},'${todo}','${priority}','${status}')`
  const result = await db.run(postBookQuery)
  response.send('Todo Successfully Added')
})

//api4
app.put('/todos/:todoId', async (request, response) => {
  let data = null
  let putTodoQuery = ''
  const todoDetails = request.body
  const {priority, status, todo} = todoDetails
  const {todoId} = request.params
  switch (true) {
    case havePriority(request.body):
      const {priority} = todoDetails
      putTodoQuery = `UPDATE todo 
    SET priority='${priority}'
    WHERE id=${todoId};`
      data = await db.run(putTodoQuery)
      response.send('Priority Updated')
      break

    case haveStatus(request.body):
      const {status} = todoDetails
      putTodoQuery = `UPDATE todo 
    SET status='${status}'
    WHERE id=${todoId};`
      data = await db.run(putTodoQuery)
      response.send('Status Updated')
      break

    case haveTodo(request.body):
      const {todo} = todoDetails
      putTodoQuery = `UPDATE todo 
    SET todo='${todo}'
    WHERE id=${todoId};`
      data = await db.run(putTodoQuery)
      response.send('Todo Updated')
      break
  }
})

//api5

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `DELETE FROM todo
                            WHERE id=${todoId}`
  const result = await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports=app;