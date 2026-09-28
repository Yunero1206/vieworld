import { merchImageUrl } from './merchImages';

/** Hand-authored source-space masks. Reuse original pixels; never a rectangular shop tile. */
export interface PropArtwork { source: string; viewBox: string; silhouette?: string; hanger?: boolean; tint?: string; }
export const PROP_ARTWORK: Record<string, PropArtwork> = {
  'star-shirt': { source: '/images/world-v6/shirt-cutout.webp', viewBox: '20 70 560 470', hanger: true },
  'mira-hoodie': { source: merchImageUrl('mira-hoodie-digital'), viewBox: '196 62 604 870', hanger: true,
    silhouette: 'M371 196Q370 128 405 106Q494 68 623 73Q654 71 662 100L669 166Q746 203 763 304L784 581L780 773Q773 804 759 820L764 840L739 919L657 898L667 855Q550 926 312 884L299 822L278 861L211 852L214 794L204 779L229 663L231 543L252 398Q271 271 305 241Z' },
  'kai-bomber': { source: merchImageUrl('kai-bomber-digital'), viewBox: '196 91 615 815', hanger: true,
    silhouette: 'M424 153Q427 102 454 101L570 97L607 151Q670 174 721 207Q768 239 775 329L801 565L795 751L782 812L771 900L695 887L695 839L702 785L684 763L676 815Q535 874 321 837L311 786L293 835L270 864L199 849L203 799L196 780L217 649L235 421Q253 285 276 245Q300 204 424 153Z' },
  'star-cap': { source: merchImageUrl('cap-digital'), viewBox: '110 208 780 590',
    silhouette: 'M521 251Q504 210 553 211Q610 212 606 253Q739 273 810 420L829 513Q895 507 884 565L884 599Q866 618 829 610L818 641Q772 652 727 642Q688 741 574 779Q500 812 391 773L194 713Q102 727 113 679Q130 632 237 569Q228 455 314 364Q393 267 521 251Z' },
  'star-light': { source: merchImageUrl('lightstick-digital'), viewBox: '301 65 385 828',
    silhouette: 'M452 76Q491 63 529 77Q548 87 539 104C665 124 712 275 664 371Q637 424 594 441L583 464L579 477L567 487L556 852Q554 879 530 886L457 882Q422 872 421 843L410 491L397 477L390 442C282 402 264 217 341 140Q386 98 448 94Z' },
  'mira-lightstick': { source: merchImageUrl('mira-lightstick-digital'), viewBox: '340 145 331 744',
    silhouette: 'M505 151C711 151 716 378 593 443L592 463Q550 528 549 588L564 775Q562 861 539 879L475 881Q453 872 447 818L432 624Q433 545 408 468L407 443C294 383 304 151 505 151Z' },
  'kai-lightstick': { source: merchImageUrl('kai-lightstick-digital'), viewBox: '345 125 307 764',
    silhouette: 'M435 128L560 128L647 215L646 347L580 444L588 470L576 490Q547 504 545 543L549 846Q546 873 519 885L482 885Q450 874 449 846L449 545Q447 508 426 491L411 470L414 444L348 347L348 215Z' },
  'c-lightstick-digital': { source: merchImageUrl('lightstick-digital'), viewBox: '301 65 385 828', tint: '#b9a0df',
    silhouette: 'M452 76Q491 63 529 77Q548 87 539 104C665 124 712 275 664 371Q637 424 594 441L583 464L579 477L567 487L556 852Q554 879 530 886L457 882Q422 872 421 843L410 491L397 477L390 442C282 402 264 217 341 140Q386 98 448 94Z' },
};

export function propAspect(id: string): number | undefined {
  const art = PROP_ARTWORK[id];
  if (!art) return undefined;
  const [, , width, height] = art.viewBox.split(' ').map(Number);
  return width / (height + (art.hanger ? height * .11 : 0));
}

// Album jacket faces, not the surrounding product-photography backdrop.
export const ALBUM_FACE_CROPS: Record<string, string> = {
  'cd-physical': '81 200 610 585',
  'mira-vinyl-physical': '100 213 545 586',
  'kai-cassette-physical': '642 278 280 448',
};
