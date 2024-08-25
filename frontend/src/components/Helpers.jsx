import { BACKEND_URL } from '../App';
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';

/*
gets the current store from database using the get store api call
*/
export function getStore () {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = () => {
    fetch(BACKEND_URL + '/store', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
      })
  };

  const refetch = () => {
    fetchStore();
  };

  return { data, error, refetch };
}

/*
given a store updates the store in database using the post store api call
*/
export function setStore (store) {
  fetch(BACKEND_URL + '/store', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-type': 'application/json',
    },
    body: JSON.stringify(store)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      }
    });
}

/*
custom alert function which is used to replace the alert() js function
*/
export function CustomAlert ({ message, onClose }) {
  const [showModal, setShowModal] = useState(true);

  const closeModal = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton className='border border-danger rounded alert alert-danger m-0'>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        <Modal.Title className='fs-6 text'>{`${message}`}</Modal.Title>
      </Modal.Header>
    </Modal>
  );
}

/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 *
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 * THIS FUNCTION IS NOT WRITTEN BY US, IT WAS FROM ASS3 QANDA COMP6080 STAFF
 */
export function fileToDataUrl (file) {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    return Promise.resolve(null);
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}
