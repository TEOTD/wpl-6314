/* eslint-disable react/prop-types */
function ListTask({id, name, status, deleteTask, toggleTask}){
    return(
        <li id={id}>
        <label style={{fontSize:'20px'}}>
            <input type="checkbox" defaultChecked={status} 
            onChange={() => toggleTask(id)}/>
            {name}
        </label>
        <br />
        <button>{`Edit ${name}`} </button>
        <button onClick={()=>deleteTask(id)} > {`delete ${name}`} </button>
    </li>

    )
}

export default ListTask;