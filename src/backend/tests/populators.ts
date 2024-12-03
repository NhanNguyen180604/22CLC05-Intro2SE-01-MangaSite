import { default as authorModel, default as categoryModel } from "../models/authorModel";
import mangaModel from "../models/mangaModel";
import userModel from "../models/userModel";

export async function getUser(name: string) {
  return await userModel.findOne({ name });
}

export async function getAuthor(name: string) {
  return await categoryModel.findOne({ name });
}

export async function mapAuthorsToId(...names: string[]) {
  return (await categoryModel.find({ name: { $in: names } }).select("_id")).map(node => node._id);
}

export async function getCategory(name: string) {
  return await categoryModel.findOne({ name });
}

export async function mapCategoriesToId(...names: string[]) {
  return (await categoryModel.find({ name: { $in: names } }).select("_id")).map(node => node._id);
}

/**
 * Populates a list of fake users for testing purposes.
 * Strawberry, Blueberry, Blackberry are users. Raspberry is an approved user and Elderberry is an admin.
 */
export async function populateUsers() {
  const users = [{
    name: "strawberry",
    email: "strawberry@fruits.com",
    password: "1234",
    accountType: "user",
  }, {
    name: "blueberry",
    email: "blueberry@fruits.com",
    password: "1234",
    accountType: "user",
  }, {
    name: "blackberry",
    email: "blackberry@fruits.com",
    password: "1234",
    accountType: "user",
  }, {
    name: "raspberry",
    email: "raspberry@fruits.com",
    password: "1234",
    accountType: "approved",
  }, {
    name: "elderberry",
    email: "elderberry@fruits.com",
    password: "1234",
    accountType: "admin",
  }];

  await userModel.bulkWrite(users.map(user => ({
    updateOne: {
      filter: { name: user.name },
      update: { $setOnInsert: user },
      upsert: true,
    }
  })));
}

/**
 * Populates a list of authors for testing purposes.
 */
export async function populateAuthors() {
  const authors = ["Mario", "Luigi", "Peach", "Daisy", "Yoshi", "Bowser"].map(author => ({ name: author }));
  await authorModel.bulkWrite(authors.map(author => ({
    updateOne: {
      filter: { name: author.name },
      update: { $setOnInsert: author },
      upsert: true,
    }
  })));
}

/**
 * Populates a list of categories for testing purposes.
 */
export async function populateCategories() {
  const categories = ["Paranormal", "Romance", "Battle", "Action", "Fantasy", "Shojo"].map(cat => ({ name: cat }));
  await categoryModel.bulkWrite(categories.map(cat => ({
    updateOne: {
      filter: { name: cat.name },
      update: { $setOnInsert: cat },
      upsert: true,
    }
  })));
}

/**
 * Populates a fake list of mangas for testing purposes.
 */
export async function populateMangas() {
  const mangas = [{
    name: "Where have you been all my life?",
    authors: await mapAuthorsToId("Mario", "Peach"),
    categories: await mapCategoriesToId("Fantasy", "Romance"),
    description: "A twoself-biography about how a fat Italian man flies through zero gravity to save a princess.",
    status: "In progress",
    uploader: await getUser("strawberry"),
  }, {
    name: "Five Five Five Five Five",
    authors: await mapAuthorsToId("Luigi", "Bowser"),
    categories: await mapCategoriesToId("Battle", "Paranormal"),
    description: "From awarded novelist and expert ghost hunter, Luigi brings you a chilling story about the battle against antimemetic entities, with an overarching invasive idea that is 3125.",
    status: "Completed",
    uploader: await getUser("blueberry"),
  }, {
    name: "翻訳するなこの馬鹿野郎",
    authors: await mapAuthorsToId("Daisy"),
    categories: await mapCategoriesToId("Action", "Fantasy"),
    description: "この漫画のタイトルが冗談なので、この記述何書くかわかんないわな。とにかく、あんたがこれを翻訳すると、期末試験零点になる。",
    status: "Suspended",
    uploader: await getUser("blackberry"),
  }, {
    name: "Yoshi Yoshi Yoshi YOSH!",
    authors: await mapAuthorsToId("Yoshi"),
    categories: await mapCategoriesToId("Yoshi"),
    description: "Yoshi yoshi Yosh..? Yoshi yoshi yoshi, Yoshi Yoshi! Yoshi.",
    status: "Completed",
    uploader: await getUser("raspberry"),
  }, {
    name: "Shattered",
    authors: await mapAuthorsToId("Peach", "Daisy"),
    categories: await mapCategoriesToId("Shojo", "Fantasy"),
    description: "Two young girls travel a multiverse of destroyed civilizations, gathering what remains from memory fragments.",
    status: "In progress",
    uploader: await getUser("elderberry"),
  }];
  await mangaModel.bulkWrite(mangas.map(manga => ({
    updateOne: {
      filter: { name: manga.name },
      update: { $setOnInsert: manga },
      upsert: true,
    }
  })));
}

/**
 * Simple blocking relationships.
 * 
 * Strawberry will block category "Yoshi".
 * Blueberry will block authors "Peach".
 */
export async function populateBlockList() {
  await userModel.updateOne({ name: "strawberry" }, { blacklist: { categories: await mapCategoriesToId("Yoshi") } });
  await userModel.updateOne({ name: "blueberry" }, { blacklist: { authors: await mapAuthorsToId("Peach") } });
}

/**
 * Clears all data.
 */
export async function depopulate() {
  await userModel.deleteMany();
  await authorModel.deleteMany();
  await categoryModel.deleteMany();
  await mangaModel.deleteMany();
}
