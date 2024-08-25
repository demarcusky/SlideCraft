import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../App';

/**
 * Component that handles the header of Presto
 * The logout button appears in here if the user is logged in.
 */
function Header () {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedOut = location.pathname === '/login' || location.pathname === '/register';

  /**
   * Function that handles logging out of Presto
   * Removes token from local storage.
   */
  function logout () {
    fetch(BACKEND_URL + '/admin/auth/logout', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      });
  }

  return (
    <header>
      <Navbar className="bg-dark">
        <Container fluid className='m-0'>
          <Navbar.Brand className="text-white fs-4">SlideCraft</Navbar.Brand>
          {!isLoggedOut && (
            <>
              <Button id="logoutBtn" variant="light" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
