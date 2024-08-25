import { React, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { BACKEND_URL } from '../App';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/LoginForm.module.css';
import { CustomAlert } from './Helpers.jsx';

function LoginForm () {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  /*
  gets input from the login form and calls the login api call with it
  */
  function submitForm (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    fetch(BACKEND_URL + '/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setAlert(data.error);
        } else {
          localStorage.setItem('token', data.token);
          navigate('/dashboard');
        }
      });
  }

  return (
    <main className={styles.main}>
      {alert && <CustomAlert message={`Error logging in: ${alert}`} onClose={() => setAlert(null)} />}
      <h2>Login to an existing account</h2>
      <Form onSubmit={submitForm}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" name='email' required/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name='password' required/>
        </Form.Group>
        <Button id="loginBtn" variant="primary" type="submit">
          Log In
        </Button>
      </Form>
      <br />
      <span name="register-redirect">Don&apos;t have an account? <Link to='/register' >Register here!</Link></span>
    </main>
  );
}

export default LoginForm;
