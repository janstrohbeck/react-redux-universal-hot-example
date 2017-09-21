import * as React from 'react';
import * as PropTypes from 'prop-types';

interface Props {
  user: string;
  repo: string;
  type: 'star' | 'watch' | 'fork' | 'follow';
  width: number;
  height: number;
  count: boolean;
  large: boolean;
}

const GithubButton = ({ user, repo, type, width, height, count, large }: Props) => {
  let src = `https://ghbtns.com/github-btn.html?user=${user}&repo=${repo}&type=${type}`;
  if (count) src += '&count=true';
  if (large) src += '&size=large';

  return (
    <iframe
      title={`github-button-${user}-${repo}-${type}`}
      src={src}
      allowTransparency
      frameBorder="0"
      scrolling="0"
      width={width}
      height={height}
      style={{ border: 'none', width, height }}
    />
  );
};

export default GithubButton;
