import React ,{ useState, useMemo, memo, useEffect, useRef, useCallback, createContext, Component}from 'react';
import {
  createSet,
  createAdd,
  createRemove,
  createToggle
} from './action';
import './App.css';

let idSeq = Date.now();

function bindActionCreators(actionCreators, dispatch){
  const ret = {};

  for(let key in actionCreators){
    ret[key] = function(...args){
      const actionCreator = actionCreators[key]
      const action = actionCreator(...args);
      dispatch(action)
    }
  }
  return ret;
  console.log(ret)
}

const Control = memo(function (props){
  const {addTodo} = props
  const inputRef = useRef();
  const onSubmit = (e)=>{
    e.preventDefault()

    const newText = inputRef.current.value.trim()
    if(newText.length === 0){
      return
    }
    addTodo({
    id: ++idSeq,
    text: newText,
    complete: false
    })
    inputRef.current.value = ''
  }
  return (
      <div className="control">
        <h1>todos</h1>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            ref={inputRef}
            className="new-todo"
            placeholder="what needs to be done?"
          />
        </form>
      </div>
  );
})


const TodoItem = memo( function (props){
    const {todo:{
        id,
        text,
        complete
        },
        removeTodo,
        toggleTodo
    } = props;
    const onChange = () =>{
      toggleTodo(id)
    }

    const onRemove = () =>{
      removeTodo(id)
    }
    return(
      <li className="">
        <input
          type="checkbox"
          onChange={onChange}
          checked = {complete}
        />
        <label className={complete ? 'complete' : ''}>{text}</label>
        <button onClick={onRemove}>&#xd7;</button>
      </li>
    )
})

const Todos = memo(function (props){
  //const {todos, toggleTodo, removeTodo} = props;
  const {todos, removeTodo, toggleTodo} = props;
  return (
    <ul>
        {
           todos.map(todo =>{
            return (<TodoItem
              key={todo.id}
              todo={todo}
              removeTodo={removeTodo}
              toggleTodo={toggleTodo}
              >
              </TodoItem>
            )
          })
        }
    </ul>
  )
})
const LS_KEY = '_aaa_'



const TodoList = memo(function (){
  const [todos, setTodos] = useState([])

  const addTodo = useCallback((todo)=>{
    dispatch(createAdd(todo))
  },[])
  const removeTodo = useCallback((id) =>{
    dispatch(createRemove(id))
  },[])

  const toggleTodo = useCallback((id) =>{
    dispatch(createToggle(id))
  },[])

  const dispatch = useCallback((action)=>{
    const {type, payload} = action
    switch (type){
      case 'set':
        setTodos(payload)
        break;
      case 'add':
        setTodos(todos => [...todos, payload])
        break;
      case 'remove':
        setTodos(todos => todos.filter(todo =>{
          return todo.id !== payload
        }))
        break;
      case 'toggle':
        setTodos(todos => todos.map(todo =>{
          return todo.id === payload
            ?{
              ...todo,
              complete: !todo.complete
            }
            :todo;
        }))
        break;
      default:
    }
  },[])

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    dispatch(createSet(todos))
  },[])

  useEffect(()=>{
    localStorage.setItem(LS_KEY, JSON.stringify(todos));
  }, [todos])


  return (
    <div className="todo-list">
      <Control
      {
        ...bindActionCreators({
          addTodo:createAdd
        }, dispatch)
      }
      />
      <Todos
      {
        ...bindActionCreators({
          removeTodo: createRemove,
          toggleTodo: createToggle
        }, dispatch)
      }
       todos={todos}
      />
    </div>
  )
})

export default TodoList;
