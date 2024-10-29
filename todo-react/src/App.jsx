/* eslint-disable react/prop-types */
import GetTask from "./components/GetTask";
import ListTask from "./components/ListTask";
import Filter from "./components/Filter";

import { useState } from "react";

const FILTER_MAP = {
    All: () => true,
    Active: (task) => !task.completed,
    Completed: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);


function App({tasks}){
    const [taskList, setTaskList] = useState(tasks);
    const [filter, setFilter] = useState("All");

    const filterList = FILTER_NAMES.map((name) => (
        <Filter
          key={name}
          filterName={name}
          setFilter={setFilter}
        />
    ));

    const taskComponents = taskList
                                .filter(FILTER_MAP[filter])
                                .map((task) => <ListTask 
                                        id={task.id}
                                        name={task.name}
                                        key={task.id}
                                        status={task.completed}
                                        deleteTask={deleteTask}
                                        toggleTask={toggleTask}
                                        />) ;
    function addTask(name){
        console.log(name);
        /* add new task to task */
        const newTask = {id:`todo-${name}`, name, completed:false};
        setTaskList([...taskList, newTask]);

    }
    function deleteTask(id){
        setTaskList(taskList.filter((task) => task.id !== id));
    }
    function toggleTask(id){
        const tmp = taskList.map( task => {
            if (task.id === id){
              return ({...task, completed:!task.completed });
            }
            return task;
          });
          setTaskList(tmp);
    }

    return (
        <>
            <h1>ToDo List</h1>
            <h2>What needs to be done?</h2>
            {/* call getTask component */}
            <GetTask addTask={addTask} />
            {/* call FilterTasks */}
            {filterList}

            <ul>
                {taskComponents}

            {/* call ListTasks */}
            </ul>
        </>
    )
}

export default App;