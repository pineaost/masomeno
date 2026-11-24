export function PageHeading({
  title,
  visuallyHidden = false,
  children,
}: {
  title: string;
  visuallyHidden?: boolean;
  children?: React.ReactNode;
}) {
  const heading = <h1 className={visuallyHidden ? 'sr-only' : undefined}>{title}</h1>;
  if (visuallyHidden && !children) return heading;
  return (
    <header className={visuallyHidden ? 'page-actions' : 'page-heading'}>
      {heading}
      {children}
    </header>
  );
}
