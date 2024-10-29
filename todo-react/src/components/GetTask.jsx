import { useState } from "react";

// eslint-disable-next-line react/prop-types
function GetTask({addTask}){
    const [name, setName] = useState('');

    function handleSubmit(event){
        event.preventDefault();
        addTask(name);
        setName('');
    }
    function handleChange(event){
         setName(event.target.value);
    }
    return(
        <form onSubmit={handleSubmit} >
        <input type="text" value={name} onChange={handleChange} />
        <button type="submit">Add</button>
        </form>
    );
        
}

export default GetTask;