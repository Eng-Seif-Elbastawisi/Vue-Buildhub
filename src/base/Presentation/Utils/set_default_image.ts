import logoDark from "../../../assets/images/logo_dark.png";

export function setDefaultImage(event: Event, defaultImage: string = logoDark) {
  if (event.target instanceof HTMLImageElement) event.target.src = defaultImage;
}
