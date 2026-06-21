import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { PROFILE_QR_BACKGROUND } from '../../utils/qrConstants';
import { createQrMatrix } from '../../utils/qrMatrix';
import { isFinderModule, QR_DOT_INSET_RATIO, QR_FINDER_INSET_RATIO } from '../../utils/qrStyle';

type Props = {
  value: string;
  size: number;
  color?: string;
  backgroundColor?: string;
};

export function ProfileQrCode({
  value,
  size,
  color = '#000000',
  backgroundColor = PROFILE_QR_BACKGROUND,
}: Props) {
  const matrix = useMemo(() => createQrMatrix(value), [value]);
  const moduleCount = matrix.length;
  const cellSize = size / moduleCount;

  return (
    <View style={[styles.root, { width: size, height: size, backgroundColor }]}>
      {matrix.map((row, y) =>
        row.map((filled, x) => {
          if (!filled) return null;

          const finder = isFinderModule(x, y, moduleCount);
          const inset = (finder ? QR_FINDER_INSET_RATIO : QR_DOT_INSET_RATIO) * cellSize;
          const moduleSize = cellSize - inset * 2;
          const radius = finder ? moduleSize * 0.28 : moduleSize / 2;

          return (
            <View
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * cellSize + inset,
                top: y * cellSize + inset,
                width: moduleSize,
                height: moduleSize,
                borderRadius: radius,
                backgroundColor: color,
              }}
            />
          );
        }),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderRadius: 10,
  },
});
