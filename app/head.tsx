export default function Head() {
  const title = "Arius Insight™";
  const description = "Arius Insight Discovery Tools.";
  const image = "https://arius.vn/wp-content/uploads/2021/03/arius_header_logo-1.png?1681961820";

  return (
    <>
      <title>{title}</title>

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta charSet="utf-8" />

      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
