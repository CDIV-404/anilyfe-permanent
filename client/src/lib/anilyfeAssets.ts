export const anilyfeAssets = {
  hero: "/manus-storage/anilyfe-marketplace-hero-light_1cdb7313.png",
  products: {
    figure: "/manus-storage/anilyfe-product-figure-light_268c2bc3.png",
    hoodie: "/manus-storage/anilyfe-product-hoodie-light_3d68ff7a.png",
    poster: "/manus-storage/anilyfe-product-poster-light_34514b49.png",
    manga: "/manus-storage/anilyfe-product-boxset-light_ef77380b.png",
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
