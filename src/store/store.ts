import Dexie from "dexie";

interface IAnnotation {
  id: number;
  area: number;
  category_id: number;
  image_id: number;
  iscrowd: number;
  segmentation: Array<number>;
  bbox: Array<number>;
}
interface ICategory {
  id: number;
  name: string;
  supercategory: string;
}
interface IImage {
  id: number;
  coco_url?: string;
  date_captured?: string;
  file_name: string;
  flickr_url?: string;
  height: number;
  width: number;
  licence?: number;
  annotations: Array<IAnnotation>;
  annotationsArea: number;
}
interface ILicenses {
  id: number;
  name: string;
  url: string;
}

export class DatasetDatabase extends Dexie {
  annotations: Dexie.Table<IAnnotation, number>;
  categories: Dexie.Table<ICategory, number>;
  images: Dexie.Table<Image, number>;
  licenses: Dexie.Table<ILicenses, number>;

  constructor() {
    super("DatasetDatabase");
    this.version(1).stores({
      annotations: "id, image_id, area, category_id",
      categories: "id, supercategory",
      images: "id, annotationsArea",
      licenses: "id"
    });
    this.annotations = this.table("annotations");
    this.categories = this.table("categories");
    this.images = this.table("images");
    this.licenses = this.table("licenses");
    this.images.mapToClass(Image);
  }
}

export class Image implements IImage {
  id: number;
  file_name: string;
  height: number;
  width: number;
  annotations: Array<IAnnotation>;
  annotationsArea: number;
  constructor(
    id: number,
    file_name: string,
    height: number,
    width: number,
    annotations: Array<IAnnotation>,
    annotationsArea: number
  ) {
    this.id = id;
    this.file_name = file_name;
    this.height = height;
    this.width = width;
    this.annotations = annotations;
    this.annotationsArea = annotationsArea;
  }
}

export let database = new DatasetDatabase();

async function orderAnnotationsByArea(
  offset: number,
  descending: boolean,
  limit: number
) {
  if (descending) {
    return database.annotations
      .orderBy("area")
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  }
  return database.annotations
    .orderBy("area")
    .offset(offset)
    .limit(limit)
    .toArray();
}

export async function getImagesFromOrderedAnnotations(
  offset: number,
  descending: boolean,
  limit: number
) {
  const annotations = await orderAnnotationsByArea(offset, descending, limit);
  let images = [];
  for (let i = 0; i < annotations.length; i++) {
    images.push(await database.images.get(annotations[i].image_id));
  }
  return images;
}

export async function getImagesOrderedByAnnotationsArea(
  offset: number,
  descending: boolean,
  limit: number
) {
  if (descending) {
    return database.images
      .orderBy("annotationsArea")
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  }
  return database.images
    .orderBy("annotationsArea")
    .offset(offset)
    .limit(limit)
    .toArray();
}
