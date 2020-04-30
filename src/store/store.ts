import Dexie from "dexie";

interface IAnnotation {
  id: number;
  area: number;
  category_id: number;
  image_id: number;
  iscrowd: number;
  segmentation: Array<number>;
  bbox: Array<number>;
  score?: number;
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
      annotations: "id, image_id, area, category_id, score",
      categories: "id, supercategory",
      images: "id, annotationsArea",
      licenses: "id",
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

function orderAnnotationsBy(
  orderBy: string,
  descending: boolean,
  limit: number,
  offset: number
) {
  if (descending) {
    return database.annotations
      .orderBy(orderBy)
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  }
  return database.annotations
    .orderBy(orderBy)
    .offset(offset)
    .limit(limit)
    .toArray();
}

// Ordered annotations stay here to speed up loading of next pages
let orderedAnnotations: Array<IAnnotation>;
let order = false;

async function orderAnnotationsByScoreDistance(
  descending: boolean,
  median: number
) {
  let annotations = await database.annotations.toArray();
  if (descending) {
    annotations.sort((a, b) => {
      //@ts-ignore
      return Math.abs(b.score - median) - Math.abs(a.score - median);
    });
  } else {
    annotations.sort((a, b) => {
      //@ts-ignore
      return Math.abs(a.score - median) - Math.abs(b.score - median);
    });
  }
  return annotations;
}

async function getImagesFromAnnotationsOrderedByScoreDistance(
  descending: boolean,
  limit: number,
  offset: number
) {
  const median = 0.5;
  if (orderedAnnotations === undefined || order != descending) {
    orderedAnnotations = await orderAnnotationsByScoreDistance(
      descending,
      median
    );
    order = descending;
  }
  let images = [];
  for (let i = offset; i < offset + limit; i++) {
    images.push(await database.images.get(orderedAnnotations[i].image_id));
  }
  return images;
}

async function getImagesFromOrderedAnnotations(
  orderBy: string,
  descending: boolean,
  limit: number,
  offset: number
) {
  const annotations = await orderAnnotationsBy(
    orderBy,
    descending,
    limit,
    offset
  );
  let images = [];
  for (let i = 0; i < annotations.length; i++) {
    images.push(await database.images.get(annotations[i].image_id));
  }
  return images;
}

async function getImagesOrderedByAnnotationsArea(
  descending: boolean,
  limit: number,
  offset: number
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

export function loadImagesOrderedBySelectedCritera(
  sortBy: number,
  descending: boolean,
  pageSize: number,
  offset: number = 0
) {
  switch (sortBy) {
    case 0:
      return getImagesFromOrderedAnnotations(
        "area",
        descending,
        pageSize,
        offset
      );
    case 1:
      return getImagesOrderedByAnnotationsArea(descending, pageSize, offset);
    case 2:
      return getImagesFromOrderedAnnotations(
        "score",
        descending,
        pageSize,
        offset
      );
    case 3:
      return getImagesFromAnnotationsOrderedByScoreDistance(
        descending,
        pageSize,
        offset
      );
    default:
      break;
  }
}
