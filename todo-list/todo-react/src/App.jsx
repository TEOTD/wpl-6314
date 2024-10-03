import ListTask from "./components/ListTask"


function App() {
 
  return (
    <>
      <h1>TODO List</h1>
      <h2>What needs to be done?</h2>
      
      <h2>Tasks Remaining</h2>
      <ul>
        <ListTask name="Eat"/>
      </ul>
    </>
  )
}

export default App
