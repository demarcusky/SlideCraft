import { React, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStore, setStore, CustomAlert, fileToDataUrl } from './Helpers.jsx';
import { Button, Modal, Form } from 'react-bootstrap';
import Slide from './Slide.jsx';
import styles from '../styles/Presentation.module.css';
import * as detectLang from 'lang-detector';
import { HexColorPicker } from 'react-colorful';

function Presentation () {
  const navigate = useNavigate();
  const { key, slide } = useParams();
  const [alert, setAlert] = useState(null);
  const [currPres, setCurrPres] = useState({ presName: '', thumbnail: '', slides: [] });
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [slideNumber, setSlideNumber] = useState((parseInt(slide, 10) - 1));
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [showBgModal, setShowBgModal] = useState(false);
  const [defaultColor, setDefaultColor] = useState('#aabbcc');
  const [color, setColor] = useState('#aabbcc');

  const { data, error } = getStore();

  let firstSlide = (slideNumber === 0);
  let lastSlide = (slideNumber === currPres.slides.length - 1);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          goBackSlide();
          break;
        case 'ArrowRight':
          goForwardSlide();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // cleanup event for unmounting
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [goBackSlide, goForwardSlide]);

  useEffect(() => {
    if (error) {
      setAlert(error);
    } else if (data) {
      setCurrPres(data.store[key]);
    }
  }, [data, error]);

  /*
  creates a copy of store as an array and deletes the presentation
  */
  const handleDelete = () => {
    const innerStoreArray = Object.values(data.store);
    const updatedInnerStoreArray = [...innerStoreArray];
    const delKey = key - 1;
    updatedInnerStoreArray.splice(delKey, 1);

    const updatedInnerStoreObject = updatedInnerStoreArray.reduce((acc, obj, index) => {
      acc[index + 1] = obj;
      return acc;
    }, {});

    setStore({ ...data, store: updatedInnerStoreObject });
    setShowModal(false);
    navigate('/dashboard');
  };

  /*
  updates the current presentation with a new title
  */
  const handleEdit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    currPres.presName = formData.get('name');

    setCurrPres(currPres);
    setStore(data);
    setShowEditModal(false);
  }

  /*
  updates slide number and sends the user to the previous slide
  */
  function goBackSlide () {
    if (slideNumber !== 0) {
      setSlideNumber(slideNumber - 1);
      lastSlide = false;
      navigate(`/presentation/${key}/${(slideNumber + 1) - 1}`);
    }
    if ((slideNumber - 1) === 0) {
      firstSlide = true;
    }
  }

  /*
  updates slide number and sends the user to the next slide
  */
  function goForwardSlide () {
    if (slideNumber !== (currPres.slides.length - 1)) {
      setSlideNumber(slideNumber + 1);
      firstSlide = false;
      navigate(`/presentation/${key}/${(slideNumber + 1) + 1}`);
    }
    if ((slideNumber + 1) === (currPres.slides.length - 1)) {
      lastSlide = true;
    }
  }

  /*
  add a new slide to the obj then calls set store to update database
  */
  function addSlide () {
    const newSlides = [...currPres.slides, { background: 'default', obj: [] }];
    const updatedCurrPres = { ...currPres, slides: newSlides };

    setCurrPres(updatedCurrPres);
    lastSlide = (slideNumber === newSlides.length - 1);
    setStore({ ...data, store: { ...data.store, [key]: updatedCurrPres } });
  }

  /*
  changes the thumbnail data to url then store in the database
  */
  function changeThumbnail (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    fileToDataUrl(formData.get('image')).then((image) => {
      currPres.thumbnail = image;
      setStore(data);
      setShowThumbnailModal(false);
    });
  }

  /*
  remove the current slide from the obj then calls set store to update database
  */
  function deleteSlide () {
    if (currPres.slides.length === 1) {
      setAlert('Cannot delete only slide');
    } else {
      const updatedSlides = [...currPres.slides];
      updatedSlides.splice(slideNumber, 1);
      const updatedCurrPres = { ...currPres, slides: updatedSlides };
      setCurrPres(updatedCurrPres);
      setStore({ ...data, store: { ...data.store, [key]: updatedCurrPres } });

      if (slideNumber === updatedSlides.length) {
        setSlideNumber(updatedSlides.length - 1);
        lastSlide = true;
        firstSlide = (updatedSlides.length === 1);
      } else if (slideNumber === 0) {
        firstSlide = false;
      } else {
        setSlideNumber(slideNumber - 1);
        firstSlide = false;
        lastSlide = false;
      }
    }
  }

  /*
  pulls input data from the modal form, creates an object then sends to the obj array in database
  */
  function addText (event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const currObj = {
      type: 'text',
      text: formData.get('text'),
      size: formData.get('size'),
      width: formData.get('width'),
      height: formData.get('height'),
      color: formData.get('colour'),
      fontFamily: 'Arial',
      xPos: 0,
      yPos: 0,
    };

    currPres.slides[slideNumber].obj.push(currObj);
    setCurrPres(currPres);
    setStore({ ...data, store: { ...data.store, [key]: currPres } });
    setShowAddTextModal(false);
  }

  /*
  pulls input data from the modal form, creates an object then sends to the obj array in database
  */
  function addImage (event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const imageInput = event.target.elements.image.files;
    const urlInput = event.target.elements.url.value;

    if ((imageInput.length === 0 && urlInput === '') || (imageInput.length > 0 && urlInput !== '')) {
      setAlert('You must either upload an image or give an image url, not both');
      return;
    }

    if (imageInput.length > 0) {
      fileToDataUrl(formData.get('image')).then((img) => {
        const currObj = {
          type: 'image',
          image: img,
          width: formData.get('width'),
          height: formData.get('height'),
          description: formData.get('description'),
          xPos: 0,
          yPos: 0
        };

        currPres.slides[slideNumber].obj.push(currObj);
        setCurrPres(currPres);
        setStore({ ...data, store: { ...data.store, [key]: currPres } });
        setShowAddImageModal(false);
      });
    } else if (urlInput !== '') {
      const currObj = {
        type: 'image',
        image: formData.get('url'),
        width: formData.get('width'),
        height: formData.get('height'),
        description: formData.get('description'),
        xPos: 0,
        yPos: 0
      };

      currPres.slides[slideNumber].obj.push(currObj);
      setCurrPres(currPres);
      setStore({ ...data, store: { ...data.store, [key]: currPres } });
      setShowAddImageModal(false);
    }
  }

  /*
  pulls input data from the modal form, creates an object then sends to the obj array in database
  */
  function addVideo (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    let autoPlay = true;
    if (formData.get('autoplay') === null) {
      autoPlay = false;
    }
    const currObj = {
      type: 'video',
      link: formData.get('link'),
      width: formData.get('width'),
      height: formData.get('height'),
      autoplay: autoPlay,
      xPos: 0,
      yPos: 0
    };

    currPres.slides[slideNumber].obj.push(currObj);
    setCurrPres(currPres);
    setStore({ ...data, store: { ...data.store, [key]: currPres } });
    setShowAddVideoModal(false);
  }

  /*
  pulls input data from the modal form, creates an object then sends to the obj array in database
  */
  async function addCode (event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const language = detectLang(formData.get('code'));
    let lang = '';
    switch (language) {
      case 'C':
        lang = 'c';
        break;
      case 'JavaScript':
        lang = 'javascript';
        break;
      case 'Python':
        lang = 'python';
        break;
      default:
        setAlert('Language is not valid');
        return;
    }

    const currObj = {
      type: 'code',
      code: formData.get('code'),
      language: lang,
      size: formData.get('size'),
      width: formData.get('width'),
      height: formData.get('height'),
      xPos: 0,
      yPos: 0,
    };

    currPres.slides[slideNumber].obj.push(currObj);
    setCurrPres(currPres);
    setStore({ ...data, store: { ...data.store, [key]: currPres } });
    setShowAddCodeModal(false);
  }

  /**
   * Handles the event of changing the background colour
   * @param {Event} event
   */
  function changeBackground (event) {
    event.preventDefault();

    for (const slide of currPres.slides) {
      if (slide.background === 'default') {
        slide.background = defaultColor;
      }
    }
    currPres.slides[slideNumber].background = color;

    setCurrPres(currPres);
    setStore({ ...data, store: { ...data.store, [key]: currPres } });
    setShowBgModal(false);
  }

  /*
  opens a new window/tab and show an enlarged slide with editting disabled
  */
  function openPreview () {
    const url = {
      pathname: `/presentation/${key}/preview/1`,
      search: `?pres=${encodeURIComponent(JSON.stringify(currPres))}&presId=${key}`,
    };
    window.open(`${url.pathname}${url.search}`, '_blank');
  }

  return (
    <main className={styles.main}>
      {alert && <CustomAlert message={`Error: ${alert}`} onClose={() => setAlert(null)} />}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this presentation?</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            No
          </Button>
          <Button id="deleteBtn" variant="danger" onClick={handleDelete}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Form onSubmit={handleEdit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formPresentationName">
              <Form.Label>Presentation Name</Form.Label>
              <Form.Control
                type="text"
                placeholder={currPres.presName}
                name='name'
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button id="editBtn" variant="primary" type="submit">
              Edit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showThumbnailModal} onHide={() => setShowThumbnailModal(false)}>
        <Form onSubmit={changeThumbnail}>
          <Modal.Header closeButton>
            <Modal.Title>Choose a new thumbnail</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formPresentationName">
              <img className="mb-3" width={'100%'} height={'50%'} src={currPres.thumbnail}/>
              <Form.Control
                type="file"
                name='image'
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit">
              Edit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showAddTextModal} onHide={() => setShowAddTextModal(false)}>
        <Form onSubmit={addText}>
          <Modal.Header closeButton>
            <Modal.Title>Add Text</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                style={{ resize: 'none' }}
                rows={5}
                name="text"
                placeholder="Text"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="size"
                placeholder="Font size (in em)"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="width"
                placeholder="Width Percentage (0-100)"
                min="0"
                max="100"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="height"
                placeholder="Height Percentage (0-100)"
                min="0"
                max="100"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="colour"
                placeholder="Text colour (HEX colour code)"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button name="textSubmit" variant="primary" type="submit">
              Add
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showAddImageModal} onHide={() => setShowAddImageModal(false)}>
        <Form onSubmit={addImage}>
          <Modal.Header closeButton>
            <Modal.Title>Add Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Control
                type="file"
                name="image"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="url"
                placeholder="Image url"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="width"
                placeholder="Width Percentage (0-100)"
                min="1"
                max="100"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="height"
                placeholder="Height Percentage (0-100)"
                min="1"
                max="100"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                style={{ resize: 'none' }}
                rows={5}
                name="description"
                placeholder="Description of the image"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button name="imageSubmit" variant="primary" type="submit">
              Add
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showAddVideoModal} onHide={() => setShowAddVideoModal(false)}>
        <Form onSubmit={addVideo}>
          <Modal.Header closeButton>
            <Modal.Title>Add Video</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter the link of the video"
                name="link"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="width"
                placeholder="Width Percentage (0-100)"
                min="1"
                max="100"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="height"
                placeholder="Height Percentage (0-100)"
                min="1"
                max="100"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Autoplay"
                name="autoplay"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button name="videoSubmit" variant="primary" type="submit">
              Add
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showAddCodeModal} onHide={() => setShowAddCodeModal(false)}>
        <Form onSubmit={addCode}>
          <Modal.Header closeButton>
            <Modal.Title>Add Code</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
            <Form.Control
                as="textarea"
                style={{ resize: 'none' }}
                rows={5}
                name="code"
                placeholder="Write your code here"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="size"
                placeholder="Font size (in em)"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="width"
                placeholder="Width Percentage (0-100)"
                min="0"
                max="100"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="height"
                placeholder="Height Percentage (0-100)"
                min="0"
                max="100"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button name="codeSubmit" variant="primary" type="submit">
              Add
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showBgModal} onHide={() => setShowBgModal(false)}>
        <Form onSubmit={changeBackground}>
          <Modal.Header closeButton>
            <Modal.Title>Change Background</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3 d-flex flex-column gap-4">
              <div>
                <h5>Change the slide colour</h5>
                <HexColorPicker color={color} onChange={setColor} />
              </div>
              <div>
                <h5>Change the default colour of slides</h5>
                <HexColorPicker color={defaultColor} onChange={setDefaultColor} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button name="colourSubmit" variant="primary" type="submit">
              Apply Colours
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <div className='container-fluid'>
        <div className='row justify-content-between align-items-center'>
          <div className='col col-lg-3'>
            <button className='btn' onClick={() => { navigate('/dashboard'); }}>&larr; Back</button>
          </div>
          <div className='col-md-auto text-center'>
            <h3 className='m-0'>{currPres.presName}</h3>
            <button name="editTitle" className={`${styles.editTitle} border-0 bg-transparent text-muted`} onClick={() => setShowEditModal(true)}>Edit Title</button>
          </div>
          <div className='col col-lg-3 d-flex justify-content-end align-items-center'>
              <button className="btn btn-primary me-1" onClick={() => setShowThumbnailModal(true)} style={{ whiteSpace: 'nowrap' }}>Edit Thumbnail</button>
              <button onClick={openPreview} className="btn btn-success me-1" style={{ whiteSpace: 'nowrap' }}><b>Preview</b></button>
              <button name="deleteModal" className="btn btn-danger" onClick={() => setShowModal(true)} style={{ whiteSpace: 'nowrap' }}>Delete Presentation</button>
          </div>
        </div>
      </div>

      <div className='d-grid' style={{ gridAutoFlow: 'column' }}>
        <button name="backSlide" className="border-0 bg-transparent" onClick={goBackSlide} style={{ visibility: (!firstSlide && currPres.slides.length > 1) ? 'visible' : 'hidden' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
          </svg>
        </button>
        <div className="card" style={{ width: '70vw', height: '60vh' }}>
          <div className="card-header d-flex justify-content-between align-items-center" style={{ overflow: 'auto' }}>
            <button name="textModal" type="button" className="btn btn-info" onClick={() => setShowAddTextModal(true)}>Add Text</button>
            <button name="imageModal" type="button" className="btn btn-info" onClick={() => setShowAddImageModal(true)}>Add Image</button>
            <button name="videoModal" type="button" className="btn btn-info" onClick={() => setShowAddVideoModal(true)}>Add Video</button>
            <button name="codeModal" type="button" className="btn btn-info" onClick={() => setShowAddCodeModal(true)}>Add Code</button>
            <button name="bgModal" type="button" className="btn btn-info" onClick={() => setShowBgModal(true)}>Background Colour</button>
          </div>
          <div className="card-body position-relative p-0">
            {currPres.slides.length > 0 &&
              <Slide
                background={currPres.slides[slideNumber].background}
                slideNumber={slideNumber}
                currPres={currPres}
                setCurrPres={setCurrPres}
                presId={key}
                isPreview={false}
              />
            }
            <b className={styles.slideNumber}>{slideNumber + 1}</b>
          </div>
          <div className="card-footer d-flex justify-content-between align-items-center">
            <button name="newSlide" className="btn btn-primary" onClick={addSlide}>+ Add</button>
            <button name="deleteSlideBtn" className="btn btn-danger" onClick={deleteSlide}>Delete Slide</button>
          </div>
        </div>
        <button name="forwardSlide" className="border-0 bg-transparent" onClick={goForwardSlide} style={{ visibility: (!lastSlide && currPres.slides.length > 1) ? 'visible' : 'hidden' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </button>
      </div>
    </main>
  );
}

export default Presentation;
