export default function Image(props: { src: string }) {
  if (props.src.length === 0) {
    return <></>;
  }
  return <img src={props.src} />;
}
