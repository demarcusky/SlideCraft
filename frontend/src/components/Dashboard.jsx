import { React, useState, useEffect } from 'react';
import { Button, Modal, Form, Card } from 'react-bootstrap';
import { getStore, setStore, CustomAlert } from './Helpers.jsx';
import styles from '../styles/Dashboard.module.css';
import image from '../images/empty.jpg';
import { Link } from 'react-router-dom';

function Dashboard () {
  const [empty, setEmpty] = useState(true);
  const [presentations, setPresentations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState(null);

  const { data, error, refetch } = getStore();

  useEffect(() => {
    if (error) {
      setAlert(error);
    } else if (data) {
      if (Object.values(data.store).length !== 0) {
        setEmpty(false);
      }
      setPresentations(Object.values(data.store).map(presentation => ({
        name: presentation.presName,
        thumbnail: presentation.thumbnail,
        description: presentation.description,
        slides: presentation.slides.length
      })));
    }
  }, [data, error]);

  const closeModal = () => {
    setShowModal(false);
  };

  /*
  handles the creation of a presentation with the basic object and add it to the store in database
  */
  const createPresentation = (event) => {
    event.preventDefault();
    setEmpty(false);

    const formData = new FormData(event.target);

    if (error) {
      setAlert(error);
    } else if (data) {
      const presId = Object.keys(data.store).length + 1;
      const presName = formData.get('name');
      const thumbnail = image;
      const description = formData.get('description');
      const slides = [
        {
          background: 'default',
          obj: []
        }
      ];
      const presentation = { presName, thumbnail, description, slides };

      data.store[presId] = presentation;
      setStore(data);
      closeModal();
      refetch();
    }
  }

  return (
    <main className={styles.dashboard}>
      {alert && <CustomAlert message={`Error creating presentation: ${alert}`} onClose={() => setAlert(null)} />}
      <Button
        className={`${styles.newPresentation}`}
        name="addPresentation"
        variant="primary btn-lg"
        onClick={() => setShowModal(true)}
      >
        + New Presentation
      </Button>

      <h2 className='sticky-top'>Slides</h2>
      <div className={`${styles.presentationContainer}`}>
      {empty
        ? (
            <h2 className='text-muted'>Create a presentation to get started</h2>
          )
        : (
            Object.keys(presentations).map((key) => (
              <Link key={parseInt(key) + 1} to={`/presentation/${parseInt(key) + 1}/1`} className='text-decoration-none'>
                <Card id={parseInt(key) + 1} className={`${styles.presentation}`}>
                  <Card.Img className={`${styles.thumbnail}`} variant="top" src={presentations[key].thumbnail} />
                  <Card.Body className={`${styles.cardBody} p-0`}>
                    <Card.Title className="p-0 m-0">
                      <span>{presentations[key].name}
                        <br />
                        <h6>Slides: {presentations[key].slides}</h6>
                      </span>
                      <p style={{ fontWeight: 'normal', fontSize: '0.8em' }}>{presentations[key].description}</p>
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Link>
            ))
          )}
      </div>

      <Modal show={showModal} onHide={closeModal}>
        <Form onSubmit={createPresentation}>
          <Modal.Header closeButton>
            <Modal.Title>Create a new presentation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formPresentationName">
              <Form.Label>Presentation Name</Form.Label>
              <Form.Control
                type="text"
                id='presName'
                name='name'
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                style={{ resize: 'none' }}
                name='description'
                id='presDes'
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button id='presSub' variant="primary" type='submit'>
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
}

export default Dashboard;
