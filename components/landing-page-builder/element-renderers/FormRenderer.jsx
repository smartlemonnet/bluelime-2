import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import useResponsiveStyles from '@/hooks/useResponsiveStyles';

const FormRenderer = ({ element, layoutId, currentMode = 'desktop' }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    content,
    formFields = [],
    submitButtonText = 'Submit',
    fieldBackgroundColor = '#FFFFFF',
    fieldTextColor = '#1F2937',
    submitButtonTextColor = '#FFFFFF',
    submitButtonBackgroundType,
    submitButtonGradientStartColor,
    submitButtonGradientEndColor,
    submitButtonGradientDirection,
    submitButtonColor: formSubmitButtonSolidColor,
    textColor,
    fontSize,
    fontFamily,
    fontWeight,
    textAlign,
    id: elementId,
  } = element;

  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const responsiveStyles = useResponsiveStyles(currentMode, element);

  const handleInputChange = (e, fieldId) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const submissionData = formFields.reduce((acc, field) => {
      acc[field.label] = formData[field.id] || '';
      return acc;
    }, {});
    
    // Extract recipient info from the layout owner
    const { data: layoutData, error: layoutError } = await supabase
      .from('landing_page_layouts')
      .select('user_id, created_by')
      .eq('id', layoutId)
      .single();

    if (layoutError || !layoutData) {
      toast({
        title: "Submission Error",
        description: "Could not find layout owner information.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', layoutData.user_id)
      .single();
    
    if (userError || !userData) {
      toast({
        title: "Submission Error",
        description: "Could not retrieve recipient email.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const recipientEmail = userData.email;
    const recipientUsername = layoutData.created_by?.username || 'the layout owner';

    const { data, error } = await supabase
      .from('form_submissions')
      .insert([{ 
        layout_id: layoutId, 
        form_data: submissionData,
        recipient_email: recipientEmail,
        username: recipientUsername,
        email: submissionData['Mail'] || submissionData['Email'] || submissionData['email'],
      }]);
    
    if (error) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Invoke edge function to send email
    try {
        const { error: functionError } = await supabase.functions.invoke('send-form-email', {
            body: JSON.stringify({
                recipientEmail,
                recipientUsername,
                formData: submissionData,
                layoutName: element.layoutName || 'your layout', 
            }),
        });
        if (functionError) throw functionError;

        toast({
          title: "Form Submitted!",
          description: "Thank you for your submission. We'll be in touch shortly.",
        });
        setFormData({});
        navigate('/thank-you');

    } catch (functionError) {
        console.error("Error invoking send-form-email function:", functionError);
        toast({
          title: "Submission Successful, But...",
          description: "We received your data, but there was an issue sending the confirmation email.",
          variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  const submitButtonStyle = {
    color: submitButtonTextColor,
    padding: responsiveStyles.isMobile ? '8px 12px' : '10px 15px',
    borderRadius: responsiveStyles.borderRadius ? `${responsiveStyles.borderRadius}px` : '6px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.2s ease',
    marginTop: 'auto',
    opacity: isSubmitting ? 0.7 : 1,
    fontSize: responsiveStyles.fontSize ? `${responsiveStyles.fontSize}px` : 
      (fontSize ? `${fontSize}px` : '16px'),
  };

  if (submitButtonBackgroundType === 'gradient') {
    submitButtonStyle.backgroundImage = `linear-gradient(${submitButtonGradientDirection || 'to bottom right'}, ${submitButtonGradientStartColor || '#8B5CF6'}, ${submitButtonGradientEndColor || '#3B82F6'})`;
  } else {
    submitButtonStyle.backgroundColor = formSubmitButtonSolidColor || '#6D28D9';
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full h-full flex flex-col space-y-3 overflow-y-auto p-0" 
      style={{ justifyContent: 'space-between' }}
    >
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
        <h3 className="text-lg font-semibold mb-3" style={{ 
          color: textColor || '#333333', 
          fontSize: responsiveStyles.fontSize ? `${responsiveStyles.fontSize}px` : 
            `${fontSize || 18}px`, 
          fontFamily: fontFamily || 'Roboto, sans-serif', 
          fontWeight: fontWeight || 'normal', 
          textAlign: textAlign || 'left' 
        }}>
          {content || "Form Title"}
        </h3>
        {formFields.map((field) => {
          const commonProps = {
            key: field.id,
            id: field.id,
            placeholder: field.placeholder || field.label,
            required: field.required,
            value: formData[field.id] || '',
            onChange: (e) => handleInputChange(e, field.id),
            style: { 
              backgroundColor: fieldBackgroundColor, 
              color: fieldTextColor, 
              borderColor: '#CBD5E1', 
              width: '100%', 
              padding: responsiveStyles.isMobile ? '8px' : '10px', 
              marginBottom: responsiveStyles.isMobile ? '10px' : '12px', 
              borderRadius: responsiveStyles.borderRadius ? `${responsiveStyles.borderRadius}px` : '6px', 
              borderStyle: 'solid', 
              borderWidth: '1px',
              fontSize: responsiveStyles.isMobile ? '16px' : '14px',
            },
            className: "focus:ring-purple-500 focus:border-purple-500"
          };

          if (field.type === 'textarea') {
            return <textarea {...commonProps} className={`${commonProps.className} min-h-[70px]`} />;
          }
          return <input {...commonProps} type={field.type} />;
        })}
      </div>
      <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </button>
    </form>
  );
};

export default FormRenderer;