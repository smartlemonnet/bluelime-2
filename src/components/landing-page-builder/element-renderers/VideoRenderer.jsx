import React from 'react';
import { getYouTubeEmbedUrl } from '@/lib/utils';

const VideoRenderer = ({ element }) => {
  const {
    content,
    videoSourceType,
    directVideoUrl,
    uploadedVideoUrl,
    borderRadius,
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
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
        <div
          className="youtube-drag-handle"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: '40px',
            cursor: 'move',
          }}
        ></div>
      </div>
    );
  }

  if (videoUrlForDisplay) {
    return (
      <video
        key={videoUrlForDisplay}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: borderRadius ? `${borderRadius}px` : undefined }}
        src={videoUrlForDisplay}
        controls
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
    }}>
      No video source
    </div>
  );
};

export default VideoRenderer;