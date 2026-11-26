/**
 * Route template. Unlike a layout, a template re-mounts on every navigation, so wrapping the page in
 * an element with an entry animation gives each route a short fade-and-rise transition.
 * The animation is defined in globals.css (.page-enter) and switched off for reduced motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
