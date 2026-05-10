import React, { useState } from 'react';
import axios from 'axios';
import { FaHourglassHalf, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const KycUpload = ({ onSuccess, user }) => {
  const hasKycSubmission = !!(
    user?.kycDetails?.submittedAt ||
    user?.kycDocuments?.length > 0 ||
    user?.kycDetails?.fullName
  );
  const currentStatus = hasKycSubmission ? user?.kycDetails?.kycStatus : null;
  const isPending = currentStatus === 'pending';
  const isVerified = currentStatus === 'verified';

  const [formData, setFormData] = useState({
    fullName: user?.kycDetails?.fullName || '',
    phoneEmail: user?.kycDetails?.phoneEmail || user?.email || '',
    country: user?.kycDetails?.country || 'US',
    phoneNumber: user?.kycDetails?.phoneNumber || '',
    additionalDetails: user?.kycDetails?.additionalDetails || ''
  });
  const [files, setFiles] = useState({
    idCardFront: null,
    idCardBack: null
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryCodes = {
    'US': '+1',
    'GB': '+44',
    'CA': '+1',
    'AU': '+61',
    'IN': '+91',
    'DE': '+49',
    'FR': '+33',
    'IT': '+39',
    'ES': '+34',
    'NL': '+31',
    'BE': '+32',
    'CH': '+41',
    'SE': '+46',
    'NO': '+47',
    'DK': '+45',
    'FI': '+358',
    'PL': '+48',
    'CZ': '+420',
    'HU': '+36',
    'RO': '+40',
    'BR': '+55',
    'MX': '+52',
    'AR': '+54',
    'CL': '+56',
    'JP': '+81',
    'CN': '+86',
    'KR': '+82',
    'SG': '+65',
    'MY': '+60',
    'TH': '+66',
    'PH': '+63',
    'VN': '+84',
    'ID': '+62',
    'ZA': '+27',
    'AE': '+971',
    'SA': '+966',
    'EG': '+20',
    'NG': '+234',
    'IL': '+972',
    'NZ': '+64',
    'PK': '+92',
    'BD': '+880',
    'LK': '+94',
    'KE': '+254'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    if (!formData.fullName.trim()) {
      setStatus('Please enter your full name.');
      return;
    }
    if (!formData.phoneEmail.trim()) {
      setStatus('Please enter your email address.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setStatus('Please enter your phone number.');
      return;
    }
    if (!formData.additionalDetails.trim()) {
      setStatus('Please provide additional details.');
      return;
    }
    if (!files.idCardFront) {
      setStatus('Please upload ID card front.');
      return;
    }
    if (!files.idCardBack) {
      setStatus('Please upload ID card back.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('phoneEmail', formData.phoneEmail);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('countryCode', countryCodes[formData.country]);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('additionalDetails', formData.additionalDetails);
      formDataToSend.append('idCardFront', files.idCardFront);
      formDataToSend.append('idCardBack', files.idCardBack);

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/kyc/upload', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setStatus(response.data.message);
      if (onSuccess) onSuccess();
    } catch (error) {
      setStatus(error?.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusPanel = () => {
    const icon = isPending ? <FaHourglassHalf /> : isVerified ? <FaCheckCircle /> : <FaExclamationTriangle />;
    const headline = isPending ? 'KYC Under Review' : isVerified ? 'KYC Verified' : 'KYC Review Needed';
    const message = isPending
      ? 'Your KYC submission is currently under review. You will be notified by email once the verification is complete.'
      : 'Your KYC has already been verified. Thank you for completing the process.';

    return (
      <div className="kyc-status-card">
        <div className="status-icon">{icon}</div>
        <h2>{headline}</h2>
        <p>{message}</p>
        {isVerified && (
          <div className="review-info">
            <p>Your account is fully verified and you can continue using the platform.</p>
          </div>
        )}
      </div>
    );
  };

  if (isPending || isVerified) {
    return renderStatusPanel();
  }

  return (
    <form className="kyc-form" onSubmit={handleSubmit}>
      <h2>KYC Verification Form</h2>
      <p className="form-description">Please fill in all the required fields to complete your KYC verification.</p>

      <div className="form-section">
        <h3>Personal Information</h3>

        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneEmail">Email Address *</label>
          <input
            type="email"
            id="phoneEmail"
            name="phoneEmail"
            value={formData.phoneEmail}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
            >
              {Object.keys(countryCodes).sort().map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <div className="phone-input">
              <span className="country-code">{countryCodes[formData.country]}</span>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="additionalDetails">Additional Details *</label>
          <textarea
            id="additionalDetails"
            name="additionalDetails"
            value={formData.additionalDetails}
            onChange={handleInputChange}
            placeholder="Provide any additional details about yourself"
            rows="4"
            required
          ></textarea>
        </div>
      </div>

      <div className="form-section">
        <h3>ID Card Verification</h3>
        <p className="section-description">Please upload clear images of both sides of your ID card.</p>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="idCardFront">ID Card Front *</label>
            <input
              type="file"
              id="idCardFront"
              name="idCardFront"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
            {files.idCardFront && <div className="file-preview">{files.idCardFront.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="idCardBack">ID Card Back *</label>
            <input
              type="file"
              id="idCardBack"
              name="idCardBack"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
            {files.idCardBack && <div className="file-preview">{files.idCardBack.name}</div>}
          </div>
        </div>
      </div>

      {status && <div className={`status-message error`}>{status}</div>}

      <button type="submit" disabled={isSubmitting} className="submit-button">
        {isSubmitting ? 'Submitting...' : 'Submit KYC'}
      </button>
    </form>
  );
};

export default KycUpload;