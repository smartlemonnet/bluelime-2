import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const FormPreview = ({ element }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    content,
    fontSize,
    fontFamily,
    textAlign,
    textColor,
    formFields = [],
    recipientEmail,
    submitButtonText = 'Submit',
    submitButtonColor: formSubmitButtonSolidColor,
    fieldBackgroundColor = '#FFFFFF',
    fieldTextColor = '#1F2937',
    submitButtonTextColor = '#FFFFFF',
    submitButtonHoverColor,
    submitButtonBackgroundType,
    submitButtonGradientStartColor,
    submitButtonGradientEndColor,
    submitButtonGradientDirection,
    layoutId,
  } = element;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      alert('Recipient email not configured for this form.');
      return;
    }
    if (!layoutId) {
      alert('Layout ID is missing. Cannot submit form.');
      console.error('Form submission error: layoutId is missing from element prop.', element);
      return;
    }

    setIsSubmitting(true);
    let submissionError = null;
    let functionError = null;

    try {
      const { data: submission, error: dbError } = await supabase
        .from('form_submissions')
        .insert({
          layout_id: layoutId,
          form_data: formData,
          recipient_email: recipientEmail,
          username: 'Anonymous',
          email: formData.email || 'anonymous@example.com'
        })
        .select()
        .single();

      if (dbError) {
        submissionError = dbError;
        throw dbError;
      }

      const { data: funcData, error: funcErr } = await supabase.functions.invoke('send-form-email', {
        body: JSON.stringify({
          formData,
          recipientEmail,
          layoutName: content || 'Unnamed Form'
        })
      });

      if (funcErr) {
        functionError = funcErr;
        throw funcErr;
      }

      navigate('/thank-you', {
        state: {
          message: "Thank you for your submission!",
          returnUrl: window.location.pathname
        }
      });
    } catch (error) {
      console.error('Form submission process error:', error);
      if (submissionError) {
        alert(`Error saving submission to database: ${submissionError.message}. Please try again.`);
      } else if (functionError) {
        alert(`Submission saved, but error sending email: ${functionError.message}.`);
      } else {
        alert('An unexpected error occurred during form submission. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const formInnerContainerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const formFieldsContainerStyle = {
    overflowY: 'hidden',
    flexGrow: 1,
    marginBottom: '15px'
  };

  const fieldStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: fieldBackgroundColor,
    color: fieldTextColor,
    fontSize: `${fontSize ? fontSize * 0.9 : 14}px`,
    fontFamily: fontFamily || 'Roboto, sans-serif',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: textColor,
    fontSize: `${fontSize ? fontSize * 0.9 : 14}px`,
    fontFamily: fontFamily || 'Roboto, sans-serif',
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '10px 15px',
    borderRadius: '6px',
    border: 'none',
    color: submitButtonTextColor,
    fontSize: `${fontSize || 16}px`,
    fontFamily: fontFamily || 'Roboto, sans-serif',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease, background-color 0.2s ease',
    marginTop: 'auto',
    boxSizing: 'border-box',
  };

  if (submitButtonBackgroundType === 'gradient') {
    submitButtonStyle.backgroundImage = `linear-gradient(${submitButtonGradientDirection || 'to bottom right'}, ${submitButtonGradientStartColor || '#8B5CF6'}, ${submitButtonGradientEndColor || '#3B82F6'})`;
    submitButtonStyle.backgroundColor = 'transparent';
  } else {
    submitButtonStyle.backgroundColor = formSubmitButtonSolidColor || '#6D28D9';
  }

  return (
    <form onSubmit={handleFormSubmit} style={formInnerContainerStyle}>
      <div style={formFieldsContainerStyle}>
        <h3 style={{
          fontSize: `${fontSize || 18}px`,
          fontFamily: fontFamily || 'Roboto, sans-serif',
          textAlign: textAlign || 'left',
          color: textColor || '#333333',
          margin: '0 0 15px 0'
        }}>
          {content || "Form Title"}
        </h3>

        {formFields.map((field, index) => (
          <div key={field.id || index} style={{ marginBottom: '12px' }}>
            {field.type === 'textarea' ? (
              <textarea
                id={field.id || `field-${index}`}
                required={field.required}
                onChange={(e) => handleInputChange(field.id || `field-${index}`, e.target.value)}
                placeholder={field.placeholder || field.label}
                style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }}
                aria-label={field.label}
              />
            ) : (
              <input
                type={field.type}
                id={field.id || `field-${index}`}
                required={field.required}
                onChange={(e) => handleInputChange(field.id || `field-${index}`, e.target.value)}
                placeholder={field.placeholder || field.label}
                style={fieldStyle}
                aria-label={field.label}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={submitButtonStyle}
        onMouseOver={(e) => {
          if (submitButtonBackgroundType !== 'gradient' && submitButtonHoverColor) {
            e.currentTarget.style.backgroundColor = submitButtonHoverColor;
          } else if (submitButtonBackgroundType === 'gradient') {
            e.currentTarget.style.opacity = '0.85';
          }
        }}
        onMouseOut={(e) => {
          if (submitButtonBackgroundType !== 'gradient') {
            e.currentTarget.style.backgroundColor = formSubmitButtonSolidColor || '#6D28D9';
          } else {
            e.currentTarget.style.opacity = '1';
          }
        }}
      >
        {isSubmitting ? 'Sending...' : (submitButtonText || 'Submit')}
      </button>
    </form>
  );
};

export default FormPreview;