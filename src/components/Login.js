import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Hook para redirección

const Login = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Hook para redirigir al TaskList después del login

  // Función que maneja el login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !pass) {
      setErrorMessage('Por favor, ingrese ambos campos.');
      return;
    }

    try {
      // Realizamos el login con axios
      const response = await axios.post('http://localhost:4000/api/v1/employee/login', { email, pass });

      // Guardamos el token en el localStorage
      localStorage.setItem('authToken', response.data.token);

      // Redirigimos al componente TaskList después de un login exitoso
      navigate('/organizations');
    } catch (error) {
      // Si ocurre un error, mostramos el mensaje adecuado
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Hubo un error al conectar con el servidor');
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Introduce tu correo"
            required
          />
        </div>
        <div>
          <label htmlFor="pass">Contraseña</label>
          <input
            type="password"
            id="pass"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Introduce tu contraseña"
            required
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
