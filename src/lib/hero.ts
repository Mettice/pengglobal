/**
 * The element id the site header watches to know when it sits over the
 * home hero. Kept in its own module so the header — which renders on
 * every page — does not import the hero component and drag its video
 * and motion code into every page's bundle.
 */
export const HERO_ID = "hero";

/** Height of the header bar in px; also the hero's top offset. */
export const HEADER_HEIGHT = 68;
