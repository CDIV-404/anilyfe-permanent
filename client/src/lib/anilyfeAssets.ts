export const anilyfeAssets = {
  hero: "/manus-storage/anilyfe-futuristic-hero_ef313804.png",
  products: {
    figure: "/manus-storage/product-figure_379639a9.png",
    hoodie: "/manus-storage/product-hoodie_28ded618.png",
    poster: "/manus-storage/product-poster_f291af8a.png",
    manga: "/manus-storage/product-manga-box_81cf8f69.png",
    digital: "/manus-storage/product-digital-pack_0b9b97c3.png",
  },
  collectionArt: {
    figures: "/manus-storage/anilyfe-collection-figures_f878dd1a.png",
    apparel: "/manus-storage/anilyfe-collection-apparel_be24ab05.png",
    art: "/manus-storage/anilyfe-collection-art_69d24e57.png",
    manga: "/manus-storage/anilyfe-collection-manga_fbf42cb2.png",
  },
  models: {
    figure: "/manus-storage/anilyfe-figure_9a1a1f41.glb",
    hoodie: "/manus-storage/anilyfe-hoodie_a85baece.glb",
    poster: "/manus-storage/anilyfe-poster_fe0e9bcd.glb",
    manga: "/manus-storage/anilyfe-manga-box_43891188.glb",
    digital: "/manus-storage/anilyfe-digital-pack_33f02eaf.glb",
    accessory: "/manus-storage/anilyfe-accessory_f7bd8d24.glb",
    home: "/manus-storage/anilyfe-home-living_d2e2a614.glb",
    cosplay: "/manus-storage/anilyfe-cosplay_8f8e610f.glb",
  },
} as const;

export type AnilyfeModelKey = keyof typeof anilyfeAssets.models;
