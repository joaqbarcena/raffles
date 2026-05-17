export async function loadGoogleFont(
  fontFamily: string,
  weight: number = 400
) {
  const family = weight === 400 ? fontFamily : `${fontFamily}:wght@${weight}`;
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`
    )
  ).text();
  const src = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!src) throw new Error(`Could not resolve font: ${fontFamily} weight ${weight}`);
  const data = await fetch(src).then((r) => r.arrayBuffer());
  return { name: fontFamily, data, weight, style: "normal" as const };
}
