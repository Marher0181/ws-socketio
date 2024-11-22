import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom'; // Para la redirección

const socket = io('http://localhost:4000'); // Asegúrate de que este sea el puerto correcto

const TaskList = () => {
  const navigate = useNavigate(); // Hook para redirigir al login si no está autenticado
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para manejar el cargado inicial
  const [error, setError] = useState(null); // Estado para manejar errores
  const [taskForm, setTaskForm] = useState({ // Para el formulario de creación y edición
    nombre: '',
    descripcion: '',
    progresion: '',
    fechaFinalizacion: '',
    DepartmentId: '',
  });

  // Verificamos si el token está presente en el localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    // Si no hay token, redirigimos al login
    if (!token) {
      navigate('/login'); // Redirige a login si no está autenticado
    }
  }, [navigate]); // Se ejecuta solo una vez al montar el componente

  // Cargar las tareas desde el servidor al inicio
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/task/');  // Ajusta la URL si es necesario
        if (!response.ok) {
          throw new Error('Error al obtener las tareas');
        }
        const data = await response.json();
        setTasks(data.tasks);
        setLoading(false); // Cambiar el estado de cargando a false
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message);
        setLoading(false); // Aunque haya error, terminamos la carga
      }
    };

    fetchTasks();

    // Manejadores de eventos de WebSocket
    const handleTaskCreated = (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]); // Añadir la tarea nueva
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task // Actualiza la tarea modificada
        )
      );
    };

    const handleTaskDeleted = (deletedTask) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== deletedTask._id)); // Elimina la tarea
    };

    // Escuchamos los eventos de WebSocket
    socket.on('task-created', handleTaskCreated);
    socket.on('task-updated', handleTaskUpdated);
    socket.on('task-deleted', handleTaskDeleted);

    // Cleanup al desmontar el componente
    return () => {
      socket.off('task-created', handleTaskCreated);
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task-deleted', handleTaskDeleted);
    };
  }, []); // Solo se ejecuta una vez al montar el componente

  // Crear tarea
  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:4000/api/v1/task/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskForm),
      });

      if (!response.ok) {
        throw new Error('Error al crear la tarea');
      }

      const newTask = await response.json();
      socket.emit('task-created', newTask); // Emitimos la tarea creada para WebSocket
      setTaskForm({
        nombre: '',
        descripcion: '',
        progresion: '',
        fechaFinalizacion: '',
        DepartmentId: '',
      }); // Limpiar el formulario
    } catch (error) {
      console.error('Error al crear tarea:', error);
    }
  };

  // Editar tarea
  const handleUpdateTask = async (taskId) => {
    const taskToUpdate = tasks.find((task) => task._id === taskId);
    
    if (!taskToUpdate) return;
    
    const updatedTask = { ...taskToUpdate, progresion: taskToUpdate.progresion + 10 }; // Ejemplo de actualización de la tarea

    try {
      const response = await fetch(`http://localhost:4000/api/v1/task/update/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la tarea');
      }

      const task = await response.json();
      socket.emit('task-updated', task); // Emitimos la tarea actualizada para WebSocket
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  // Eliminar tarea
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/task/delete/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la tarea');
      }

      const deletedTask = await response.json();
      socket.emit('task-deleted', deletedTask); // Emitimos la tarea eliminada para WebSocket
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  // Mostrar el estado de cargando o el error si los hay
  if (loading) {
    return <p>Cargando tareas...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Lista de Tareas</h2>

      {/* Formulario para crear una nueva tarea */}
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Nombre"
          value={taskForm.nombre}
          onChange={(e) => setTaskForm({ ...taskForm, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={taskForm.descripcion}
          onChange={(e) => setTaskForm({ ...taskForm, descripcion: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Progresión"
          value={taskForm.progresion}
          onChange={(e) => setTaskForm({ ...taskForm, progresion: e.target.value })}
          required
        />
        <input
          type="date"
          value={taskForm.fechaFinalizacion}
          onChange={(e) => setTaskForm({ ...taskForm, fechaFinalizacion: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Department ID"
          value={taskForm.DepartmentId}
          onChange={(e) => setTaskForm({ ...taskForm, DepartmentId: e.target.value })}
          required
        />
        <button type="submit">Crear tarea</button>
      </form>

      {tasks.length === 0 ? (
        <p>No hay tareas disponibles</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task._id}>
              <div>
                <h3>{task.nombre}</h3>
                <p>{task.descripcion}</p>
                <small>Fecha de Finalización: {new Date(task.fechaFinalizacion).toLocaleDateString()}</small>
                <br />
                <small>Progresión: {task.progresion}%</small>
                <br />
                {task.Asignado && <small>Asignado a: {task.Asignado}</small>}
                <br />
                <button onClick={() => handleUpdateTask(task._id)}>Actualizar</button>
                <button onClick={() => handleDeleteTask(task._id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
