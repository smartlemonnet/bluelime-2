import React from 'react';

const ImagePreview = ({ element }) => {
  const {
    content,
    imageSourceType,
    directImageUrl,
    uploadedImageUrl,
    borderRadius,
  } = element;

  let imageUrlForDisplay = 'https://t4.ftcdn.net/jpg/13/40/96/57/360_F_1340965779_ePdOzua9stloGGy282HFTbxNUz5bDMTv.jpg';

  // The 'content' field holds the most up-to-date source, whether it's a blob, URL, or final uploaded path.
  if (content && (content.startsWith('http') || content.startsWith('blob:'))) {
    imageUrlForDisplay = content;
  } else if (imageSourceType === 'uploaded_cloud' && uploadedImageUrl) {
    imageUrlForDisplay = uploadedImageUrl;
  } else if (imageSourceType === 'url' && directImageUrl) {
    imageUrlForDisplay = directImageUrl;
  }


  const finalImageUrl = !imageUrlForDisplay || imageUrlForDisplay === 'Put your image URL'
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

export default ImagePreview;