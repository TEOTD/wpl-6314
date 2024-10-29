import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const taskList = [
  {id:'todo-1', name: 'Eat', completed: true},
  {id:'todo-2', name: 'Sleep', completed: false},
  {id:'todo-3', name: 'Study', completed: false},
];

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App tasks = {taskList} />
  </StrictMode>,
)
