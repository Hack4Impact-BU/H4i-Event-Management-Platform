import React from 'react';
import './Tasks.css';


const Task = ({ task }) => {


    return (
        <div className="task_container" key={task._id}>
            <p className='task_name'>{task}</p>
        </div>
    )
}

export default Task;