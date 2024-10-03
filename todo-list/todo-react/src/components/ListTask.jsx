import PropTypes from 'prop-types'

function ListTask({name}) {
    ListTask.propTypes = {
        name: PropTypes.string.isRequired
      }
    return (
        <li>
            <label htmlFor="button">
                <input type="checkbox" /> {name}
            </label>
            <button>{`Edit ${name}`}</button>
            <button>{`Delete ${name}`}</button>
        </li>
    )
}

export default ListTask;