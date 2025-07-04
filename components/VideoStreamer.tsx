import React from "react";
import ReactPlayer from "react-player";

type Props = {
  src: string;
  poster?: string;
};

export default function VideoStreamer({ src, poster }: Props) {
  return (
    <ReactPlayer
      url={src}
      controls
      width="100%"
      height="100%"
      playing={false}
      light={poster}
      config={{
        file: {
          attributes: {
            poster,
          },
        },
      }}
    />
  );
} 