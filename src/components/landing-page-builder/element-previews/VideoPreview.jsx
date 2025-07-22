import React from 'react';
import { getYouTubeEmbedUrl } from '@/lib/utils';

const VideoPreview = ({ element }) => {
  const {
    content,
    borderRadius,
    videoSourceType,
    directVideoUrl,
    uploadedVideoUrl,
  } = element;

  let videoUrlForDisplay = '';

  if (videoSourceType === 'url' && directVideoUrl) {
    videoUrlForDisplay = directVideoUrl;
  } else if (videoSourceType === 'uploaded_cloud' && uploadedVideoUrl) {
    videoUrlForDisplay = uploadedVideoUrl;
  } else if (videoSourceType === 'uploaded_local' && content && content.startsWith('blob:')) {
    videoUrlForDisplay = content;
  } else if (content && (content.startsWith('http') || content.startsWith('blob:'))) {
    videoUrlForDisplay = content;
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrlForDisplay);

  if (youtubeEmbedUrl) {
    return (
      <iframe
        src={youtubeEmbedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: borderRadius ? `${borderRadius}px` : undefined
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded YouTube Video"
      />
    );
  }

  if (videoUrlForDisplay) {
    return (
      <video
        key={videoUrlForDisplay}
        src={videoUrlForDisplay}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: borderRadius ? `${borderRadius}px` : undefined
        }}
        controls
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      borderRadius: borderRadius ? `${borderRadius}px` : undefined,
      backgroundImage: `url('https://www.hi-trans.com.au/wp-content/uploads/2015/11/video-placeholder.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
    </div>
  );
};

export default VideoPreview;