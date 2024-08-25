import React, { useState, useRef, useEffect } from 'react';
import { getStore, setStore } from './Helpers.jsx';
import { Rnd } from 'react-rnd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Button, Modal, Form } from 'react-bootstrap';
import 'animate.css';

function Slide ({ background, slideNumber, currPres, setCurrPres, presId, isPreview }) {
  const [boxIndex, setBoxIndex] = useState(null);
  const [elements, setElements] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);

  const refs = useRef([]);
  refs.current = Array.from({ length: elements.length }, () => React.createRef());
  const modalRef = useRef(null);
  const parentRef = useRef(null);

  const { data } = getStore();

  let bgColour = 'white';
  if (background !== 'default') bgColour = background;

  useEffect(() => {
    // Trigger fadeIn animation whenever slideNumber changes
    setFadeIn(true);

    // Reset fadeIn state after animation duration
    const timeout = setTimeout(() => {
      setFadeIn(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [slideNumber]);

  useEffect(() => {
    setElements(currPres.slides[slideNumber].obj);
  }, [currPres.slides[slideNumber].obj]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        boxIndex != null &&
        refs.current[boxIndex].current &&
        !refs.current[boxIndex].current.contains(event.target) &&
        !modalRef?.current?.dialog?.contains(event.target)
      ) {
        setBoxIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [boxIndex, refs, modalRef]);

  const handleEdit = (event, index) => {
    event.preventDefault();
    setBoxIndex(index);
  };

  /*
  deletes the element at a given index then updates the database
  */
  const handleDelete = (event, index) => {
    event.preventDefault();
    setBoxIndex(null);

    const currSlide = { ...currPres.slides[slideNumber] };

    const newObj = [...currSlide.obj];
    newObj.splice(index, 1);

    const updatedCurrSlide = { ...currSlide, obj: newObj };

    const newPres = { ...currPres };
    newPres.slides[slideNumber] = updatedCurrSlide;

    refs.current = refs.current.filter((_, idx) => idx !== index);
    setElements(newObj);
    setCurrPres(newPres);
    setStore({ ...data, store: { ...data.store, [presId]: newPres } });
  };

  /*
  updates the x and y co-ordinates of a given element and then stores them in the database
  */
  const handleDrag = (event, data, index) => {
    event.preventDefault();

    const newElements = [...elements];
    newElements[index].xPos = data.x;
    newElements[index].yPos = data.y;
    setElements(newElements);

    updatePresentation(index);
  };

  /*
  updates the size of a given element and then stores it in the database
  */
  const handleResize = (event, ref, position, index) => {
    event.preventDefault();

    const newElements = [...elements];
    newElements[index].width = (ref.offsetWidth / parentRef.current.offsetWidth) * 100;
    newElements[index].height = (ref.offsetHeight / parentRef.current.offsetHeight) * 100;
    newElements[index].xPos = position.x;
    newElements[index].yPos = position.y;
    setElements(newElements);

    updatePresentation(index);
  };

  /*
  adds a new element to the slide then saves it in the database
  */
  const updatePresentation = (index) => {
    const newElement = { ...elements[index] };

    const currSlide = { ...currPres.slides[slideNumber] };
    const newObj = [...currSlide.obj];
    newObj[index] = newElement;
    currSlide.obj = newObj;

    const newPres = { ...currPres };
    newPres.slides[slideNumber] = currSlide;

    setCurrPres(newPres);
    setStore({ ...data, store: { ...data.store, [presId]: newPres } });
  }

  /*
  changes the font of the text at a given index and updates database
  */
  function handleFontSubmit (event, index) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const selectedFont = formData.get('fontSelect');
    const newElements = [...elements];
    newElements[index].fontFamily = selectedFont;
    setElements(newElements);
    updatePresentation(index);
    setShowFontModal(false);
  }

  return (
    <div className={fadeIn ? 'animate__animated animate__fadeIn animate__faster' : ''} ref={parentRef} style={{ width: '100%', height: '100%', backgroundColor: bgColour, position: 'relative', overflow: 'none' }}>
      <Modal show={showFontModal} onHide={() => setShowFontModal(false)} ref={modalRef}>
        <Form onSubmit={() => handleFontSubmit(event, boxIndex)}>
          <Modal.Header closeButton>
            <Modal.Title>Select Font</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Choose a font:</Form.Label>
              <Form.Control as="select" name="fontSelect">
                <option value="Arial">Arial</option>
                <option value="Brush Script MT">Brush Script MT</option>
                <option value="Courier New">Courier New</option>
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {elements && elements.map((element, index) => {
        if (element.type === 'text') {
          const style = {
            position: 'absolute',
            width: `${(element.width / 100) * parentRef.current.offsetWidth}px`,
            height: `${(element.height / 100) * parentRef.current.offsetHeight}px`,
            color: `${element.color}`,
            fontSize: `${element.size}em`,
            fontFamily: `${element.fontFamily}`,
            zIndex: index + 1,
            border: isPreview ? 'none' : '1px solid #ccc'
          };
          return (
            <Rnd
              key={index}
              size={{ width: (element.width / 100) * parentRef.current.offsetWidth, height: (element.height / 100) * parentRef.current.offsetHeight }}
              position={{ x: element.xPos, y: element.yPos }}
              bounds={'parent'}
              onResize={(event, direction, ref, delta, position) => handleResize(event, ref, position, index)}
              onDrag={(event, data) => handleDrag(event, data, index)}
              disableDragging={isPreview}
              enableResizing={!isPreview}
            >
              <div
                ref={refs.current[index]}
                key={index}
                style={style}
                onClick={(event) => handleEdit(event, index)}
                onContextMenu={(event) => handleDelete(event, index)}
              >
                {element.text}
                {boxIndex === index && !isPreview && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 18,
                        right: 0,
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowFontModal(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="black"
                        className="bi bi-fonts"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479z"/>
                      </svg>
                    </div>
                    <div style={{ position: 'absolute', top: -2.5, left: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', top: -2.5, right: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', bottom: -2.5, left: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', bottom: -2.5, right: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                  </>
                )}
              </div>
            </Rnd>
          );
        } else if (element.type === 'video') {
          const isAutoplay = element.autoplay;
          const style = {
            position: 'absolute',
            width: `${(element.width / 100) * parentRef.current.offsetWidth}px`,
            height: `${(element.height / 100) * parentRef.current.offsetHeight}px`,
            zIndex: index + 1,
            border: isPreview ? 'none' : '1px solid #ccc'
          };
          return (
            <Rnd
              key={index}
              default={{
                width: (element.width / 100) * parentRef.current.offsetWidth,
                height: (element.height / 100) * parentRef.current.offsetHeight,
              }}
              position={{ x: element.xPos, y: element.yPos }}
              bounds={'parent'}
              onResize={(event, direction, ref, delta, position) => handleResize(event, ref, position, index)}
              onDrag={(event, data) => handleDrag(event, data, index)}
              disableDragging={isPreview}
              enableResizing={!isPreview}
            >
              <div
                ref={refs.current[index]}
                key={index}
                style={style}
                onClick={(event) => handleEdit(event, index)}
                onContextMenu={(event) => handleDelete(event, index)}
              >
                <iframe key={index}
                  style={{
                    ...style,
                    width: '99%',
                    height: '99%',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  src={isAutoplay ? `${element.link}&autoplay=1&mute=1` : element.link}
                  allowFullScreen
                  {...(isAutoplay ? { allow: 'autoplay' } : {})}
                >
                </iframe>
                {boxIndex === index && !isPreview && (
                  <>
                    <div style={{ position: 'absolute', top: -2.5, left: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', top: -2.5, right: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', bottom: -2.5, left: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', bottom: -2.5, right: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                  </>
                )}
              </div>
            </Rnd>
          );
        } else if (element.type === 'image') {
          console.log(element);
          const style = {
            position: 'absolute',
            width: `${(element.width / 100) * parentRef.current.offsetWidth}px`,
            height: `${(element.height / 100) * parentRef.current.offsetHeight}px`,
            zIndex: index + 1,
          };
          return (
            <Rnd
              key={index}
              default={{
                width: (element.width / 100) * parentRef.current.offsetWidth,
                height: (element.height / 100) * parentRef.current.offsetHeight,
              }}
              position={{ x: element.xPos, y: element.yPos }}
              bounds={'parent'}
              onResize={(event, direction, ref, delta, position) => handleResize(event, ref, position, index)}
              onDrag={(event, data) => handleDrag(event, data, index)}
              disableDragging={isPreview}
              enableResizing={!isPreview}
            >
              <div
                ref={refs.current[index]}
                key={index}
                style={style}
                onClick={(event) => handleEdit(event, index)}
                onContextMenu={(event) => handleDelete(event, index)}
              >
                <img style={{ maxHeight: '100%', maxWidth: '100%' }} src={element.image} alt={element.description} />
                {boxIndex === index && !isPreview && (
                  <>
                    <div style={{ position: 'absolute', top: -2.5, left: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', top: -2.5, right: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', bottom: -2.5, left: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', bottom: -2.5, right: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                  </>
                )}
              </div>
            </Rnd>
          );
        } else if (element.type === 'code') {
          const style = {
            position: 'absolute',
            width: `${(element.width / 100) * parentRef.current.offsetWidth}px`,
            height: `${(element.height / 100) * parentRef.current.offsetHeight}px`,
            fontSize: `${element.size}em`,
            zIndex: index + 1,
          };
          return (
            <Rnd
              key={index}
              default={{
                width: (element.width / 100) * parentRef.current.offsetWidth,
                height: (element.height / 100) * parentRef.current.offsetHeight,
              }}
              position={{ x: element.xPos, y: element.yPos }}
              bounds={'parent'}
              onResize={(event, direction, ref, delta, position) => handleResize(event, ref, position, index)}
              onDrag={(event, data) => handleDrag(event, data, index)}
              disableDragging={isPreview}
              enableResizing={!isPreview}
            >
              <div
                ref={refs.current[index]}
                key={index}
                style={style}
                onClick={(event) => handleEdit(event, index)}
                onContextMenu={(event) => handleDelete(event, index)}
              >
                <SyntaxHighlighter language={element.language} style={ docco } className="w-100 h-100">
                  {element.code}
                </SyntaxHighlighter>
                {boxIndex === index && !isPreview && (
                  <>
                    <div style={{ position: 'absolute', top: -2.5, left: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', top: -2.5, right: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', bottom: -2.5, left: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                    <div style={{ position: 'absolute', bottom: -2.5, right: -2.5, width: '5px', height: '5px', backgroundColor: 'black' }}></div>
                  </>
                )}
              </div>
            </Rnd>
          );
        }
        return null;
      })}
    </div>
  );
}

export default Slide;
