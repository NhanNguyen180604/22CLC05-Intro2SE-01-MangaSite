import bcrypt from "bcryptjs";
import authorModel from "../models/authorModel.js";
import categoryModel from "../models/categoryModel.js";
import chapterModel from "../models/chapterModel.js";
import commentModel from "../models/commentModel.js";
import mangaModel from "../models/mangaModel.js";
import reportModel from "../models/reportModel.js";
import userModel from "../models/userModel.js";

export async function getUser(name) {
  return await userModel.findOne({ name });
}

export async function getAuthor(name) {
  return await categoryModel.findOne({ name });
}

export async function mapAuthorsToId(...names) {
  return (await authorModel.find({ name: { $in: names } }).select("_id")).map((node) => node._id);
}

export async function getCategory(name) {
  return await categoryModel.findOne({ name });
}

export async function mapCategoriesToId(...names) {
  return (await categoryModel.find({ name: { $in: names } }).select("_id")).map((node) => node._id);
}

export async function getManga(name) {
  return await mangaModel.findOne({ name });
}

export async function getChapter(manga, number) {
  return (
    await chapterModel
      .aggregate()
      .lookup({
        from: "mangas",
        localField: "manga",
        foreignField: "_id",
        as: "manga",
      })
      .unwind("$manga")
      .match({ "manga.name": manga, number })
      .limit(1)
  )[0];
}

export async function getCommentByContent(content) {
  return await commentModel.findOne({ content });
}

/**
 * Populates a list of fake users for testing purposes.
 * Strawberry, Blueberry, Blackberry are users. Raspberry is an approved user and Elderberry is an admin.
 */
export async function populateUsers() {
  const users = [
    {
      name: "strawberry",
      email: "strawberry@fruits.com",
      password: bcrypt.hashSync("1234", 12),
      avatar: {
        url: "https://www.allrecipes.com/thmb/1c99SWam7_FM6vUzpDDzIKffMR4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ALR-strawberry-fruit-or-vegetable-f6dd901427714e46af2d706a57b9016f.jpg",
      },
      accountType: "user",
    },
    {
      name: "blueberry",
      email: "blueberry@fruits.com",
      password: bcrypt.hashSync("1234", 12),
      avatar: {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlPNkMXg2WT2QA3oRCM_ujTilLNWgi5owEbw&s",
      },
      accountType: "user",
    },
    {
      name: "blackberry",
      email: "blackberry@fruits.com",
      password: bcrypt.hashSync("1234", 12),
      avatar: {
        url: "https://prairiegardens.org/wp-content/uploads/2021/02/Chester-Blackberry-1.jpg",
      },
      accountType: "user",
    },
    {
      name: "raspberry",
      email: "raspberry@fruits.com",
      password: bcrypt.hashSync("1234", 12),
      avatar: {
        url: "https://www.diggers.com.au/cdn/shop/products/raspberry-willamette-wraw_611f6bfe-4b8e-44a1-8e0f-d8c661ab493c_2048x.jpg?v=1637122646",
      },
      accountType: "approved",
    },
    {
      name: "elderberry",
      email: "elderberry@fruits.com",
      password: bcrypt.hashSync("1234", 12),
      avatar: {
        url: "https://h2.commercev3.net/cdn.gurneys.com/images/800/03177A.jpg",
      },
      accountType: "admin",
    },
  ];
  await userModel.insertMany(users);
}

/**
 * Populates a list of authors for testing purposes.
 */
export async function populateAuthors() {
  const authors = ["Mario", "Luigi", "Peach", "Daisy", "Yoshi", "Bowser"].map((author) => ({ name: author }));
  await authorModel.insertMany(authors);
}

/**
 * Populates a list of categories for testing purposes.
 */
export async function populateCategories() {
  const categories = ["Paranormal", "Romance", "Battle", "Action", "Fantasy", "Shojo", "Yoshi"].map((cat) => ({ name: cat }));
  await categoryModel.insertMany(categories);
}

/**
 * Populates a fake list of mangas for testing purposes.
 */
export async function populateMangas() {
  const mangas = [
    {
      name: "Where have you been all my life?",
      authors: await mapAuthorsToId("Mario", "Peach"),
      categories: await mapCategoriesToId("Fantasy", "Romance"),
      description: "A twoself-biography about how a fat Italian man flies through zero gravity to save a princess.",
      status: "In progress",
      uploader: await getUser("strawberry"),
    },
    {
      name: "Five Five Five Five Five",
      authors: await mapAuthorsToId("Luigi", "Bowser"),
      categories: await mapCategoriesToId("Battle", "Paranormal"),
      description:
        "From awarded novelist and expert ghost hunter, Luigi brings you a chilling story about the battle against antimemetic entities, with an overarching invasive idea that is 3125.",
      status: "Completed",
      cover: "https://s3.lubook.club/covers/temp/1.png?width=1080",
      uploader: await getUser("blueberry"),
    },
    {
      name: "翻訳するなこの馬鹿野郎",
      authors: await mapAuthorsToId("Daisy"),
      categories: await mapCategoriesToId("Action", "Fantasy"),
      description:
        "この漫画のタイトルが冗談なので、この記述何書くかわかんないわな。とにかく、あんたがこれを翻訳すると、期末試験零点になる。",
      status: "Suspended",
      uploader: await getUser("blackberry"),
    },
    {
      name: "Yoshi Yoshi Yoshi YOSH!",
      authors: await mapAuthorsToId("Yoshi"),
      categories: await mapCategoriesToId("Yoshi"),
      description: "Yoshi yoshi Yosh..? Yoshi yoshi yoshi, Yoshi Yoshi! Yoshi.",
      cover: "https://s3.lubook.club/covers/temp/2.png?width=1080",
      status: "Completed",
      uploader: await getUser("raspberry"),
    },
    {
      name: "Shattered",
      authors: await mapAuthorsToId("Peach", "Daisy"),
      categories: await mapCategoriesToId("Shojo", "Fantasy"),
      description: "Two young girls travel a multiverse of destroyed civilizations, gathering what remains from memory fragments.",
      status: "In progress",
      uploader: await getUser("elderberry"),
    },
  ];
  await mangaModel.insertMany(mangas);
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
 * Populates a list of chapters.
 */
export async function populateChapters() {
  const whybaml = (await getManga("Where have you been all my life?"))._id;
  const shattered = (await getManga("Shattered"))._id;
  const yoshi = (await getManga("Yoshi Yoshi Yoshi YOSH!"))._id;
  const five = (await getManga("Five Five Five Five Five"))._id;

  await chapterModel.insertMany([
    {
      manga: whybaml,
      number: 1,
      title: "The Girl and The Stars",
    },
    {
      manga: whybaml,
      number: 2,
      title: "The Birth of the Comet Observatory",
    },
    {
      manga: whybaml,
      number: 3,
      title: "Star Festival",
    },
    {
      manga: shattered,
      number: 1,
      title: "Eternal",
    },
    {
      manga: shattered,
      number: 2,
      title: "Grievous Lady",
    },
    {
      manga: shattered,
      number: 3,
      title: "Rememberance",
    },
    {
      manga: yoshi,
      number: 1,
      title: "Violence isn't the answer",
    },
    {
      manga: yoshi,
      number: 2,
      title: "Except when it comes to government",
    },
    {
      manga: yoshi,
      number: 3,
      title: "How to evade taxes (Part 1)",
    },
    {
      manga: five,
      number: 1,
      title: "We need to talk about Fifty-Five",
    },
    {
      manga: five,
      number: 2,
      title: "Introductory Antimemetics",
    },
    {
      manga: five,
      number: 3,
      title: "Unforgettable, That's What You Are",
    },
  ]);
}

/**
 * Populates some fake comments.
 */
export async function populateComments() {
  await commentModel.insertMany([
    {
      user: (await getUser("strawberry"))._id,
      manga: (await getManga("Shattered"))._id,
      content: "Wow luna didn't draw HK well, given that she loves procreate that much.",
    },
    {
      user: (await getUser("raspberry"))._id,
      manga: (await getManga("Five Five Five Five Five"))._id,
      content: "Adam Wheeler is too handsome",
    },
    {
      user: (await getUser("blueberry"))._id,
      manga: (await getManga("Yoshi Yoshi Yoshi YOSH!"))._id,
      chapter: 3,
      content: "Yo! I managed to get a lot of money back!",
    },
    {
      user: (await getUser("blackberry"))._id,
      manga: (await getManga("Where have you been all my life?"))._id,
      chapter: 1,
      content: "Damn she did that dude dirty",
    },
  ]);
}

/**
 * Populates some fake reports.
 */
export async function populateReports() {
  return reportModel.insertMany([
    {
      informant: (await getUser("strawberry"))._id,
      description: "Art is too cute",
      manga: (await getManga("Shattered"))._id,
    },
    {
      informant: (await getUser("blueberry"))._id,
      description: "This user also evaded tax",
      comment: (await getCommentByContent("Yo! I managed to get a lot of money back!"))._id,
    },
    {
      informant: (await getUser("raspberry"))._id,
      description: "yo bowser naked",
      chapter: (await getChapter("Where have you been all my life?", 3))._id,
    },
  ]);
}

/**
 * Clears all data.
 */
export async function depopulate() {
  await Promise.all([
    userModel.deleteMany(),
    authorModel.deleteMany(),
    categoryModel.deleteMany(),
    mangaModel.deleteMany(),
    commentModel.deleteMany(),
    reportModel.deleteMany(),
  ]);
}
