export async function getStates(db) {
  var [err, res] = await new Promise(async res => {
    var r = await db
      .collection("images")
      .aggregate([{ $group: { _id: "$datetime" } }])
      .toArray()
      .catch(e => res[(e, null)]);
    res([
      null,
      r
        .map(v => {
          return v._id;
        })
        .filter(v => v)
    ]);
  });

  if (err) throw err;
  return res.sort((a, b) => (a >= b ? 1 : -1));
}

export async function getStateImages(db, state) {
  let images = await db
    .collection("images")
    .find({ datetime: state })
    .toArray();
  return images;
}
export async function getStateImageIds(db, state) {
  const imageIds = await db
    .collection("images")
    .aggregate([{ $match: { datetime: state } }, { $group: { _id: "$id" } }])
    .toArray()
    .then(res => res.map(v => v._id));
  return imageIds;
}

export async function getMarkedImages(db) {
  let images = await db
    .collection("images")
    .aggregate([{ $match: { marked: true } }, { $sample: { size: 10 } }])
    .toArray();
  let drawing = await db
    .collection("images")
    .find({ drawing: true })
    .toArray();
  images.unshift(...drawing);

  return images;
}
export async function getMarkedImageIds(db) {
  let imageIds = await db
    .collection("images")
    .aggregate([{ $match: { marked: true } }, { $group: { _id: "$id" } }])
    .toArray()
    .then(res => res.map(v => v._id));
  let drawingIds = await db
    .collection("images")
    .aggregate([{ $match: { drawing: true } }, { $group: { _id: "$id" } }])
    .toArray()
    .then(res => res.map(v => v._id));

  return { imageIds, drawingIds };
}
export async function getImagesByIds(db, imageIds) {
  console.log(imageIds);
  const images = await db
    .collection("images")
    .find({ id: { $in: imageIds } })
    .toArray();
  return images;
}
