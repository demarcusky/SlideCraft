import { React, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { BACKEND_URL } from '../App';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/RegisterForm.module.css';
import { CustomAlert } from './Helpers.jsx';

function RegisterForm () {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  /*
  gets input from the register form and calls the register api call with it
  */
  function submitForm (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    if (formData.get('password') !== formData.get('confirmPassword')) {
      setAlert('Passwords do not match');
    } else {
      fetch(BACKEND_URL + '/admin/auth/register', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
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
  }

  return (
    <main className={styles.main}>
      {alert && <CustomAlert message={`Error registering account: ${alert}`} onClose={() => setAlert(null)} />}
      <h2>Register an account</h2>
      <Form onSubmit={submitForm}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" name='email' required/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" name='name' required/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name='password' required/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control type="password" name='confirmPassword' required/>
        </Form.Group>
        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
      <br />
      <span>Already have an account? <Link to='/login'>Login here!</Link></span>
    </main>
  );
}

export default RegisterForm;
