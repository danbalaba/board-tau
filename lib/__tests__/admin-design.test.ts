import {
  adminColors,
  adminTypography,
  adminSpacing,
  adminBorderRadius,
  adminShadows,
  adminZIndex,
  adminBreakpoints,
  adminSpinnerSizes,
  adminCardStyles,
  adminButtonStyles,
  adminInputStyles,
  adminBadgeStyles,
  adminAvatarSizes
} from '../admin-design';

describe('admin-design', () => {
  it('exports all design tokens properly', () => {
    expect(adminColors).toBeDefined();
    expect(adminColors.primary).toBeDefined();
    expect(adminTypography).toBeDefined();
    expect(adminSpacing).toBeDefined();
    expect(adminBorderRadius).toBeDefined();
    expect(adminShadows).toBeDefined();
    expect(adminZIndex).toBeDefined();
    expect(adminBreakpoints).toBeDefined();
    expect(adminSpinnerSizes).toBeDefined();
    expect(adminCardStyles).toBeDefined();
    expect(adminButtonStyles).toBeDefined();
    expect(adminInputStyles).toBeDefined();
    expect(adminBadgeStyles).toBeDefined();
    expect(adminAvatarSizes).toBeDefined();
  });
});
