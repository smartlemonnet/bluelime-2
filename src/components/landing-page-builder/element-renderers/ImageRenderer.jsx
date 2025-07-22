import React from 'react';

const ImageRenderer = ({ element }) => {
  const {
    content,
    imageSourceType,
    directImageUrl,
    uploadedImageUrl,
    borderRadius,
  } = element;

  let imageUrlForDisplay = '';

  if (imageSourceType === 'uploaded_cloud' && uploadedImageUrl && uploadedImageUrl.startsWith('http')) {
    imageUrlForDisplay = uploadedImageUrl;
  } else if (imageSourceType === 'uploaded_local' && content && content.startsWith('blob:')) {
    imageUrlForDisplay = content;
  } else if (imageSourceType === 'url' && directImageUrl && directImageUrl.startsWith('http')) {
    imageUrlForDisplay = directImageUrl;
  } else if (content && (content.startsWith('http') || content.startsWith('blob:'))) {
    imageUrlForDisplay = content;
  } else if (uploadedImageUrl && uploadedImageUrl.startsWith('http')) {
    imageUrlForDisplay = uploadedImageUrl;
  } else {
    imageUrlForDisplay = 'https://t4.ftcdn.net/jpg/13/40/96/57/360_F_1340965779_ePdOzua9stloGGy282HFTbxNUz5bDMTv.jpg';
  }

  const finalImageUrl = imageUrlForDisplay === 'Put your image URL'
    ? 'https://t4.ftcdn.net/jpg/13/40/96/57/360_F_1340965779_ePdOzua9stloGGy282HFTbxNUz5bDMTv.jpg'
    : imageUrlForDisplay;

  const imageDivStyle = {
    width: '100%',
    height: '100%',
    backgroundImage: `url('${finalImageUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: borderRadius ? `${borderRadius}px` : undefined
  };

  return <div style={imageDivStyle} draggable="false"></div>;
};

export default ImageRenderer;