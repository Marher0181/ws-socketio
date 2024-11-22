import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrganizationList = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [newOrganization, setNewOrganization] = useState({
    nombre: '',
    tipo: '',
    codigo: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener organizaciones al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }

    const fetchOrganizations = async () => {
        try {
          const response = await fetch('http://localhost:4000/api/v1/organization/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Incluir el token en el encabezado
            },
          });
      
          if (!response.ok) {
            throw new Error('Error al obtener organizaciones');
          }
      
          const data = await response.json();
          console.log(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching organizations:', error);
        }
      };

    fetchOrganizations();
  }, [navigate]);

  // Manejar la creación de una nueva organización
  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }

    try {
      const response = await fetch('http://localhost:4000/api/v1/organization/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newOrganization),
      });

      if (!response.ok) {
        throw new Error('Error al crear la organización');
      }

      const data = await response.json();
      setOrganizations((prev) => [...prev, data.organization]);
      setNewOrganization({ nombre: '', tipo: '', codigo: '' }); // Limpiar el formulario
    } catch (error) {
      console.error('Error al crear la organización:', error);
    }
  };

  // Eliminar organización
  const handleDeleteOrganization = async (id) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }

    try {
      const response = await fetch(`http://localhost:4000/api/v1/organization/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la organización');
      }

      const data = await response.json();
      setOrganizations((prev) =>
        prev.filter((org) => org._id !== id)
      ); // Eliminar la organización de la lista
    } catch (error) {
      console.error('Error al eliminar la organización:', error);
    }
  };

  // Actualizar organización
  const handleUpdateOrganization = async (id, updatedData) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }

    try {
      const response = await fetch(`http://localhost:4000/api/v1/organization/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la organización');
      }

      const data = await response.json();
      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === id ? data.organization : org
        )
      );
    } catch (error) {
      console.error('Error al actualizar la organización:', error);
    }
  };

  // Mostrar contenido
  if (loading) return <p>Cargando organizaciones...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Organizaciones</h2>

      {/* Formulario para crear una nueva organización */}
      <form onSubmit={handleCreateOrganization}>
        <input
          type="text"
          placeholder="Nombre"
          value={newOrganization.nombre}
          onChange={(e) => setNewOrganization({ ...newOrganization, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Tipo"
          value={newOrganization.tipo}
          onChange={(e) => setNewOrganization({ ...newOrganization, tipo: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Código"
          value={newOrganization.codigo}
          onChange={(e) => setNewOrganization({ ...newOrganization, codigo: e.target.value })}
          required
        />
        <button type="submit">Crear Organización</button>
      </form>

      {/* Lista de organizaciones */}
      {organizations.length === 0 ? (
        <p>No hay organizaciones disponibles</p>
      ) : (
        <ul>
          {organizations.map((org) => (
            <li key={org._id}>
              <div>
                <h3>{org.nombre}</h3>
                <p>{org.tipo}</p>
                <small>Código: {org.codigo}</small>
                <br />
                <button onClick={() => handleUpdateOrganization(org._id, { nombre: org.nombre, tipo: org.tipo, codigo: org.codigo })}>
                  Actualizar
                </button>
                <button onClick={() => handleDeleteOrganization(org._id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrganizationList;
