/**
 * "How PasteClean works" — registered in app/_layout.tsx as a Stack
 * screen with presentation: 'formSheet'. UIKit's
 * UISheetPresentationController owns the drag/snap/dismiss; no JS in
 * the gesture path, no in-content close button (Apple Mail / Reminders
 * / Notes sheets don't have one either, and the previous X button
 * caused router.dismiss() race conditions + visual hit-test conflicts
 * with the content scrolling underneath).
 */
import React from 'react';

import HowItWorksContent from '@/components/HowItWorksContent';

export default function HowItWorksScreen() {
  return <HowItWorksContent />;
}
