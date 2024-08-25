import React, { useState, useEffect } from 'react';
import Slide from './Slide.jsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getStore, CustomAlert } from './Helpers.jsx';
import styles from '../styles/Preview.module.css';

/**
 * Component that handles the preview page.
 * Background is darkened so the slides are easier to see.
 */
function Preview () {
  const navigate = useNavigate();
  const { key, slide } = useParams();
  const [slideNumber, setSlideNumber] = useState((parseInt(slide, 10) - 1));
  const [currPres, setCurrPres] = useState({ presName: '', thumbnail: '', slides: [] });
  const [alert, setAlert] = useState(null);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const presId = searchParams.get('presId');

  const { data, error } = getStore();

  let firstSlide = (slideNumber === 0);
  let lastSlide = (slideNumber === currPres.slides.length - 1);

  useEffect(() => {
    if (error) {
      setAlert(error);
    } else if (data) {
      setCurrPres(data.store[presId]);
    }
  }, [data, error]);

  /**
   * Handles going back a slide during the preview
   * Updates URL to reflect this change.
   */
  function goBackSlide () {
    if (slideNumber !== 0) {
      setSlideNumber(slideNumber - 1);
      lastSlide = false;
      navigate(`/presentation/${key}/preview/${(slideNumber + 1) - 1}`);
    }
    if ((slideNumber - 1) === 0) {
      firstSlide = true;
    }
  }

  /**
   * Handles going forward a slide during the preview
   * Updates URL to reflect this change.
   */
  function goForwardSlide () {
    if (slideNumber !== (currPres.slides.length - 1)) {
      setSlideNumber(slideNumber + 1);
      firstSlide = false;
      navigate(`/presentation/${key}/preview/${(slideNumber + 1) + 1}`);
    }
    if ((slideNumber + 1) === (currPres.slides.length - 1)) {
      lastSlide = true;
    }
  }

  return (
    <main className={styles.main}>
      {alert && <CustomAlert message={`Error: ${alert}`} onClose={() => setAlert(null)} />}
      <div className='d-grid' style={{ gridAutoFlow: 'column' }}>
        <button className="border-0 bg-transparent" onClick={goBackSlide} style={{ visibility: (!firstSlide && currPres.slides.length > 1) ? 'visible' : 'hidden' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" className="bi bi-chevron-left" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
          </svg>
        </button>
        <div className={styles.slide}>
          {currPres.slides.length > 0 &&
            <Slide
              background={currPres.slides[slideNumber].background}
              slideNumber={slideNumber}
              currPres={currPres}
              setCurrPres={setCurrPres}
              presId={presId}
              isPreview={true}
            />
          }
          <b className={styles.slideNumber}>{slideNumber + 1}</b>
        </div>
        <button className="border-0 bg-transparent" onClick={goForwardSlide} style={{ visibility: (!lastSlide && currPres.slides.length > 1) ? 'visible' : 'hidden' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" className="bi bi-chevron-right" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </button>
      </div>
    </main>
  );
}

export default Preview;
