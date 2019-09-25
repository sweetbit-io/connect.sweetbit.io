import React from 'react';
import Spinner from './spinner';

export default ({ children, onClick, submit, loading }) => (
  <button
    onClick={onClick}
    className={`submit ${loading ? 'loading' : ''}`}
    type={submit ? 'submit' : 'button'}
  >
    <span className="label">{children}</span>
    <span className="spinner">
      <Spinner />
    </span>
    <style jsx>{`
      * {
        box-sizing: border-box;
      }
      .submit {
        color: white;
        border: none;
        display: inline-flex;
        border-radius: 6px;
        background: #5335B8;
        border: 2px solid #5335B8;
        font-size: 16px;
        line-height: 18px;
        text-decoration: none;
        white-space: nowrap;
        font-weight: 300;
        overflow: hidden;
        transition: opacity 0.3s ease;
        padding: 12px 20px;
        position: relative;
      }
      .submit .label {
        opacity: 1;
        transition: opacity 0.3s ease;
      }
      .submit .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -12px;
        margin-top: -12px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .submit.loading .label {
        opacity: 0;
      }
      .submit.loading .spinner {
        opacity: 1;
      }
    `}</style>
  </button>
);
