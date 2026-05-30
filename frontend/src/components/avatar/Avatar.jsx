function Avatar({ imageUrl, username, size = 40 }) {
  let fontSize;
  if (typeof size === "number") {
    fontSize = size / 2;
  } else {
    fontSize = `calc(${size} / 2)`;
  }

  const style = { width: size, height: size, fontSize };

  if (imageUrl) {
    return (
      <div className="avatar" style={style}>
        <img src={imageUrl} alt={username} />
      </div>
    );
  }

  return (
    <div className="avatar avatar--default" style={style}>
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

export default Avatar;
