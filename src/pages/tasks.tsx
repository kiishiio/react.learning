import React, { useEffect } from "react";
import Header from "../comp/header";
import "./tasks.css";
import styles from "../comp/universal.module.css"
import Cookies from "js-cookie";

interface Task {
    id: number;
    title: string;
    date: string;
    description: string;
    deadline: string;
    isEditing: boolean;
    isComplete: boolean;
}

const Tasks: React.FC = () => {
    const [tasks, setTasks] = React.useState<Task[]>([]);

    useEffect(() => {
        const savedTasks = loadTasks();
        setTasks(savedTasks)
    }, []);


    const addTask = (newTask: Task) => {
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const saveTask = (id: number, updatedTask: Partial<{ title: string; date: string; description: string; deadline: string; }>) => {
        setTasks((prevTasks) => {
            const updatedTasks = prevTasks.map((task) =>
                task.id === id ? { ...task, ...updatedTask, isEditing: false } : task
            );
            saveTasks(updatedTasks);
            return updatedTasks;
        });
    };

    const handleDelete = (id: number) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    };

    const handleChecked = (id: number, updatedTask: Partial<{ title: string; date: string; description: string; deadline: string; }>) => {        
        setTasks((prevTasks) => {
            const updatedTasks = prevTasks.map((task) =>
                task.id === id ? { ...task, ...updatedTask, isEditing: false, isComplete: !task.isComplete  } : task
            );
            saveTasks(updatedTasks);
            return updatedTasks;
        });
    }

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent, id: number, isTouch: boolean) => {
        const currentTask = tasks.find((task) => task.id === id);
        if (currentTask?.isEditing) return;
        const startX = isTouch
        ? (e as React.TouchEvent).touches[0].clientX
        : (e as React.MouseEvent).clientX;

        const handleTouchMove = (moveEvent: TouchEvent | MouseEvent) => {
            const moveX = "touches" in moveEvent 
                ? moveEvent.touches[0]?.clientX ?? startX
                : (moveEvent as MouseEvent).clientX;

            const swipeDistance = startX - moveX;

            const taskElement = document.getElementById(`task-${id}`);
            if (taskElement) {
                taskElement.style.transform = `translateX(${-swipeDistance}px)`;
            }
        };

        const handleTouchEnd = (endEvent: TouchEvent | MouseEvent) => {
            const endX = "changedTouches" in endEvent
            ? endEvent.changedTouches[0]?.clientX ?? startX
            : (endEvent as MouseEvent).clientX;

            const swipeDistance = startX - endX;

            const taskElement = document.getElementById(`task-${id}`);
            if (taskElement) {
                if (swipeDistance > 100) {
                    taskElement.style.transform = `transform 0.15s none`;
                    taskElement.style.transform = `translateX(-100%)`;
                    setTimeout(() => handleDelete(id), 300);
                } else if(swipeDistance < 0) {
                    taskElement.style.transform = `transform 0.15s none`;
                    taskElement.style.transform = `translateX(0)`;
                    if (currentTask) {
                        const { id, title, date, description, deadline } = currentTask;
                        handleChecked(id, { title, date, description, deadline });
                    }
                }
                else {
                    taskElement.style.transform = `transform 0.15s none`;
                    taskElement.style.transform = `translateX(0)`;
                }
            }

            document.removeEventListener(isTouch ? "touchmove" : "mousemove", handleTouchMove);
            document.removeEventListener(isTouch ? "touchend" : "mouseup", handleTouchEnd);
        };

        document.addEventListener(isTouch ? "touchmove" : "mousemove", handleTouchMove);
        document.addEventListener(isTouch ? "touchend" : "mouseup", handleTouchEnd);
    };

    const sortTasks = (key: keyof Task, order: "asc" | "desc") => {
        const sortedTasks = [...tasks].sort((a,b) => {
            if (a[key] < b[key]) return order === "asc" ? -1 : 1;
            if (a[key] > b[key]) return order === "asc" ? 1 : -1;
            return 0;
        })

        setTasks(sortedTasks);
        saveTasks(sortedTasks);
    };

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    const endOfYearStr = endOfYear.toISOString().split("T")[0];

    return (
        <div>
            <Header text='tasks'/>
            <div className={styles.hasBackground} id="thisContainer">
                <div className={styles.area} id="taskArea">
                    <div className={`taskSort`}>
                        <button onClick={() => sortTasks("deadline", "asc")} className={`sortButton`}>deadline</button>
                        <p className={styles.flexCenter} style={{fontSize: "10px"}}>sort</p>
                        <button onClick={() => sortTasks("date", "asc")} className={`sortButton`}>created</button>
                    </div>

                    {tasks.map((task) => (
                        <div 
                            key={`task-${task.id}-${task.isComplete}`}
                            id={`task-${task.id}`}
                            style={{ backgroundColor: task.isComplete ? "rgba(79, 136, 77, 0.3)" : "none" }}
                            className={`${styles.component} taskComponent`}
                            onTouchStart={(e) => handleTouchStart(e, task.id, true)}
                            onMouseDown={(e) => handleTouchStart(e, task.id, false)}
                        >
                            {task.isEditing ? (
                                <>
                                    <div className="task">
                                        <div className="taskHeader">
                                            <div className="taskDate" id="taskDate">{task.date}</div>
                                            <input
                                                className={`${"taskName"}`}
                                                id="taskName"
                                                type="text"
                                                placeholder="enter title"
                                                maxLength={20}
                                                defaultValue={task.title}
                                                onChange={(e) => (task.title = e.target.value)}    
                                            />
                                            <input
                                                className={`${"taskDeadline"}`}
                                                id="taskDeadline"
                                                type="date"
                                                min={todayStr}
                                                max={endOfYearStr}
                                                defaultValue={task.deadline}
                                                onChange={(e) => (task.deadline = e.target.value)}    
                                            />
                                        </div>
                                        <textarea
                                                className={`${"taskDescription"}`}
                                                id="taskDescription"
                                                placeholder="enter description"
                                                defaultValue={task.description}
                                                onChange={(e) => (task.description = e.target.value)}    
                                            />
                                    </div>
                                    <button className={`${"taskButton"} ${styles.button}`} onClick={() => {
                                        saveTask(task.id, {
                                            title: task.title,
                                            description: task.description,
                                            deadline: task.deadline,
                                        });
                                    }} id="taskSave">
                                        <svg width="16" height="16" fill="floralwhite" viewBox="0 0 16 16">
                                            <path d="M12 2h-2v3h2z"/>
                                            <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5V2.914a1.5 1.5 0 0 0-.44-1.06L14.147.439A1.5 1.5 0 0 0 13.086 0zM4 6a1 1 0 0 1-1-1V1h10v4a1 1 0 0 1-1 1zM3 9h10a1 1 0 0 1 1 1v5H2v-5a1 1 0 0 1 1-1"/>
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <svg width="32" height="32" fill="rgba(34, 85, 33, 0.8)" viewBox="0 0 16 16" style={{display: task.isComplete ? "block" : "none", marginRight:"6px"}}>
                                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                      <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                                    </svg>
                                    <div className="task">
                                        <div className="taskHeader">
                                            <div className="taskDate">{task.date.slice(5)}</div>
                                            <div className="taskName">{task.title}</div>
                                            <div className="taskDeadline">{task.deadline.slice(5)}</div>
                                        </div>
                                        <div className="taskDescription">{task.description}</div>
                                    </div>
                                    <button className={`${"taskButton"} ${styles.button}`} onClick={() => {
                                        setTasks((prevTasks) => prevTasks.map((t) => (
                                            t.id === task.id ? { ...t, isEditing: true } : t
                                        )))
                                    }}>
                                        <svg width="16" height="16" fill="floralwhite" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <button className={styles.button} id="taskCreate" onClick={() => 
                    addTask({
                        id: Date.now(),
                        title: "",
                        date: new Date().toISOString().split('T')[0],
                        description: "",
                        deadline: new Date().toISOString().split('T')[0],
                        isEditing: true,
                        isComplete: false,
                    })
                }>
                    <svg width="32" height="32" fill="floralwhite" viewBox="0 0 16 16">
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                </button>

            </div>
            <p id="notice">tasks get saved for 30 days</p>
        </div>
    )
};

const saveTasks = (tasks: Task[]) => {
    Cookies.set("tasks", JSON.stringify(tasks), { expires: 30 });
}

const loadTasks = (): Task[] => {
    const tasks = Cookies.get("tasks");
    return tasks ? JSON.parse(tasks) : [];
}

export default Tasks;