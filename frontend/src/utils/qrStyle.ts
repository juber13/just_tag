/** Gap between modules for the dotted QR look (0–0.5). */
export const QR_DOT_INSET_RATIO = 0.14;

/** Finder corners use tighter inset for bolder anchors. */
export const QR_FINDER_INSET_RATIO = 0.06;

export function isFinderModule(x: number, y: number, moduleCount: number): boolean {
  if (x < 7 && y < 7) return true;
  if (x >= moduleCount - 7 && y < 7) return true;
  if (x < 7 && y >= moduleCount - 7) return true;
  return false;
}

/** Whether a point inside a module cell (0–1) should be filled for export. */
export function isStyledModulePixel(
  localX: number,
  localY: number,
  finder: boolean,
): boolean {
  const inset = finder ? QR_FINDER_INSET_RATIO : QR_DOT_INSET_RATIO;

  if (finder) {
    return (
      localX >= inset &&
      localX <= 1 - inset &&
      localY >= inset &&
      localY <= 1 - inset
    );
  }

  const radius = 0.5 - inset;
  const dx = localX - 0.5;
  const dy = localY - 0.5;
  return dx * dx + dy * dy <= radius * radius;
}
