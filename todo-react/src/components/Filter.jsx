function Filter({filterName, setFilter}){
    return(
        <button onClick={()=> setFilter(filterName) }>
          <span> {filterName} tasks</span>
        </button>
    );

}

export default Filter;